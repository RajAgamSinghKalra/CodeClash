#!/usr/bin/env python3
"""
predict.py – YOLOv8 inference + evaluation on HackByte test split
──────────────────────────────────────────────────────────────────
 • Waits (≤10 s) for best.pt to appear.
 • Finds best.pt in:
        /media/agam/Local Disk/codeclash/train/pt/best.pt      (preferred)
        newest /media/agam/Local Disk/codeclash/train/yolo_run*/weights/best.pt
 • Runs inference on every test image, saves:
        predict/images/*.png  (boxes drawn)
        predict/labels/*.txt  (YOLO-format)
 • Evaluates split="test", logs P, R, mAP and copies PNG graphs.
"""

import os, sys, time, shutil, logging, argparse
from pathlib import Path
import cv2, yaml
from ultralytics import YOLO

# ------------------------------------------------------------------ #
#  Paths (edit if directory tree moves)                              #
# ------------------------------------------------------------------ #
TRAIN_ROOT = Path("/media/agam/Local Disk/codeclash/train")
DATA_YAML  = Path("/home/agam/Downloads/Hackathon_Dataset/HackByte_Dataset/yolo_params.yaml")

PRED_ROOT  = Path("/media/agam/Local Disk/codeclash/predict")
IMG_OUT, LBL_OUT = PRED_ROOT / "images", PRED_ROOT / "labels"
GRAPH_DIR, PT_DIR, LOG_DIR = PRED_ROOT / "graphs", PRED_ROOT / "pt", PRED_ROOT / "log"
for d in (IMG_OUT, LBL_OUT, GRAPH_DIR, PT_DIR, LOG_DIR):
    d.mkdir(parents=True, exist_ok=True)

# ------------------------------------------------------------------ #
#  Logging                                                           #
# ------------------------------------------------------------------ #
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(LOG_DIR / "predict.log", mode="w"),
        logging.StreamHandler(sys.stdout)
    ]
)
logging.info("=== YOLOv8 prediction script started ===")

# ------------------------------------------------------------------ #
#  CLI                                                               #
# ------------------------------------------------------------------ #
ap = argparse.ArgumentParser(description="Run YOLOv8 predictions on test split")
ap.add_argument("--conf", type=float, default=0.25, help="Confidence threshold")
args = ap.parse_args()
logging.info(f"Confidence threshold = {args.conf}")

# ------------------------------------------------------------------ #
#  Locate best.pt (wait a few seconds if launched right after train) #
# ------------------------------------------------------------------ #
def find_best_pt(max_wait: int = 10) -> Path:
    preferred = TRAIN_ROOT / "pt" / "best.pt"
    t0 = time.time()
    while time.time() - t0 < max_wait:
        if preferred.is_file():
            return preferred
        # fallback: newest yolo_run*/weights/best.pt
        runs = sorted(
            TRAIN_ROOT.glob("yolo_run*/weights/best.pt"),
            key=lambda p: p.stat().st_mtime,
            reverse=True
        )
        if runs:
            if not preferred.is_file():
                logging.warning(f"No global best.pt – using {runs[0]}")
            return runs[0]
        time.sleep(1)
    raise FileNotFoundError("best.pt not found in expected locations.")

try:
    BEST_PT = find_best_pt()
except FileNotFoundError as e:
    logging.error(e)
    sys.exit(1)

logging.info(f"Using checkpoint: {BEST_PT}")
model = YOLO(str(BEST_PT))            # ROCm GPU-0 (autodetected)
shutil.copy2(BEST_PT, PT_DIR / "best.pt")   # stash a copy

# ------------------------------------------------------------------ #
#  Locate test images                                                #
# ------------------------------------------------------------------ #
with DATA_YAML.open() as f:
    yaml_dict = yaml.safe_load(f)
test_rel = yaml_dict.get("test")
if test_rel is None:
    logging.error("'test:' key missing in yolo_params.yaml")
    sys.exit(1)

test_img_dir = (DATA_YAML.parent / test_rel / "images").resolve()
imgs = sorted(p for p in test_img_dir.iterdir()
              if p.suffix.lower() in {".png", ".jpg", ".jpeg"})
if not imgs:
    logging.error(f"No images in {test_img_dir}")
    sys.exit(1)

logging.info(f"Found {len(imgs)} test images")

# ------------------------------------------------------------------ #
#  Helper: predict single image                                      #
# ------------------------------------------------------------------ #
def predict_and_save(img: Path):
    res = model.predict(img, conf=args.conf, device=0, verbose=False)[0]

    # Save annotated PNG
    cv2.imwrite(str(IMG_OUT / img.name), res.plot())

    # Save YOLO txt (class xc yc w h, normalised)
    txt_path = LBL_OUT / img.with_suffix(".txt").name
    with txt_path.open("w") as f:
        for b in res.boxes:
            cls = int(b.cls)
            x, y, w, h = b.xywhn[0].tolist()
            f.write(f"{cls} {x} {y} {w} {h}\n")

# ------------------------------------------------------------------ #
#  Inference loop                                                    #
# ------------------------------------------------------------------ #
for i, img_path in enumerate(imgs, 1):
    predict_and_save(img_path)
    if i % 50 == 0 or i == len(imgs):
        logging.info(f"Inferred {i}/{len(imgs)}")

logging.info(f"Annotated images  → {IMG_OUT}")
logging.info(f"Prediction labels → {LBL_OUT}")

# ------------------------------------------------------------------ #
#  Evaluate on split="test"                                          #
# ------------------------------------------------------------------ #
val_res  = model.val(data=str(DATA_YAML), split="test",
                     device=0, plots=True, save=True)
metrics  = val_res.metrics  # dict: precision, recall, map50, map

logging.info(
    f"TEST metrics | P={metrics['precision']:.4f}  "
    f"R={metrics['recall']:.4f}  "
    f"mAP@0.5={metrics['map50']:.4f}  "
    f"mAP@0.5:0.95={metrics['map']:.4f}"
)

# ------------------------------------------------------------------ #
#  Copy evaluation graphs                                            #
# ------------------------------------------------------------------ #
for png in Path(val_res.save_dir).glob("*.png"):
    shutil.copy2(png, GRAPH_DIR)
logging.info(f"Graphs copied → {GRAPH_DIR}")
logging.info("=== YOLOv8 prediction script finished ===")
