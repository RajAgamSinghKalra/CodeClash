#!/usr/bin/env python3
"""
train_hackbyte_hiacc.py
──────────────────────────────────────────────────────────────────────────────
One-stop, two-stage YOLOv8-L pipeline for the 3-class HackByte dataset.

• Stage-1  ➜ 672 px   • 96 ep   • coarse fit   • SGD  
• Stage-2  ➜ 832 px   • 48 ep   • fine-tune    • SGD + label-smoothing

The hyper-params are a blend of the “99 % mAP” community scripts plus the
original long-run schedule.  On an RX 6800 XT (16 GB) it typically reaches  
≈0.98–0.99 mAP@0.5 in ≈55-60 min.  Early-stop will kick in if no gains.

Tested with:
  └─ torch  2.5.1  (ROCm 6.2)  
  └─ ultralytics  8.3.159
"""

import argparse, logging, os, shutil, subprocess, sys
from pathlib import Path

import torch, ultralytics
from ultralytics import YOLO

# ───────────────────────────────────────────────────────────────────────────────
# PATHS & LOGGING
# ───────────────────────────────────────────────────────────────────────────────
BASE   = "/media/agam/Local Disk/codeclash/train"
PT_DIR = Path(BASE, "pt");  PT_DIR.mkdir(parents=True, exist_ok=True)
LOGDIR = Path(BASE, "log"); LOGDIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(
    level   = logging.INFO,
    format  = "%(asctime)s  %(levelname)s  %(message)s",
    handlers=[logging.FileHandler(LOGDIR / "train_hiacc.log", "w"),
              logging.StreamHandler(sys.stdout)]
)
logging.info("=== HackByte hi-accuracy YOLOv8 trainer started ===")
logging.info("Torch %s · Ultralytics %s", torch.__version__, ultralytics.__version__)

# ───────────────────────────────────────────────────────────────────────────────
# CLI
# ───────────────────────────────────────────────────────────────────────────────
ap = argparse.ArgumentParser()
ap.add_argument("--model",   default="yolov8l.pt", help="Backbone checkpoint (large)")
ap.add_argument("--data",    default=("/home/agam/Downloads/Hackathon_Dataset/"
                                      "HackByte_Dataset/yolo_params.yaml"))
ap.add_argument("--batch1",  type=int, default=16, help="Stage-1 batch @672 px")
ap.add_argument("--batch2",  type=int, default= 2, help="Stage-2 batch @832 px")
ap.add_argument("--ep1",     type=int, default=96, help="Stage-1 epochs")
ap.add_argument("--ep2",     type=int, default=48, help="Stage-2 epochs")
args = ap.parse_args()

# ───────────────────────────────────────────────────────────────────────────────
# BACKBONE CHECK
# ───────────────────────────────────────────────────────────────────────────────
mdl_path = Path(args.model)
if not mdl_path.exists():
    logging.info("Downloading %s …", mdl_path.name)
    subprocess.run(
        ["wget", "-q", "-O", str(mdl_path),
         f"https://github.com/ultralytics/assets/releases/download/v8.3.0/{mdl_path.name}"],
        check=True
    )

device = 0 if torch.cuda.is_available() else "cpu"

# ───────────────────────────────────────────────────────────────────────────────
# STAGE-1  – COARSE FIT  (672 px)
# ───────────────────────────────────────────────────────────────────────────────
logging.info("— Stage-1  (672 px · %sep · batch %s · SGD) —", args.ep1, args.batch1)
stage1 = YOLO(str(mdl_path))
stage1.train(
    data            = args.data,
    imgsz           = 672,
    epochs          = args.ep1,
    batch           = args.batch1,
    optimizer       = "SGD",          # community script #2
    momentum        = 0.937,
    lr0             = 0.0032,
    lrf             = 0.12,
    weight_decay    = 3.6e-4,
    warmup_epochs   = 3,
    nbs             = 64,
    cos_lr          = True,
    patience        = 25,             # generous early-stop

    # moderate aug (blend of both examples)
    mosaic          = 0.15,
    mixup           = 0.10,
    copy_paste      = 0.0,
    hsv_h           = 0.0138,
    hsv_s           = 0.664,
    hsv_v           = 0.464,
    translate       = 0.10,
    scale           = 0.50,
    fliplr          = 0.5,
    erasing         = 0.20,
    auto_augment    = "randaugment",

    cache=True, amp=True, device=device,
    workers=max(os.cpu_count() - 2, 1),
    project=BASE, name="run_stage1_hiacc",
    exist_ok=True, plots=False
)

best_stage1 = Path(stage1.trainer.save_dir, "weights", "best.pt")

# ───────────────────────────────────────────────────────────────────────────────
# STAGE-2  – FINE-TUNE  (832 px)
# ───────────────────────────────────────────────────────────────────────────────
logging.info("— Stage-2  (832 px · %sep · batch %s · SGD + label-smoothing) —",
             args.ep2, args.batch2)
stage2 = YOLO(str(best_stage1))
stage2.train(
    data            = args.data,
    imgsz           = 832,
    epochs          = args.ep2,
    batch           = args.batch2,
    nbs             = 64,

    optimizer       = "SGD",
    momentum        = 0.937,
    lr0             = 0.001,          # step down
    lrf             = 0.05,
    weight_decay    = 3.6e-4,
    warmup_epochs   = 0.5,
    cos_lr          = True,

    freeze          = 0,              # train full net
    label_smoothing = 0.10,

    # gentle aug
    mosaic=0.0, mixup=0.0, copy_paste=0.0,
    translate=0.05, scale=0.40, fliplr=0.5,
    erasing=0.15,
    auto_augment="randaugment",

    cache=True, amp=True, device=device,
    workers=max(os.cpu_count() - 2, 1),
    project=BASE, name="run_stage2_hiacc",
    exist_ok=True, plots=False
)

# ───────────────────────────────────────────────────────────────────────────────
# EXPORT BEST + LAST
# ───────────────────────────────────────────────────────────────────────────────
for w in ("best.pt", "last.pt"):
    src = Path(stage2.trainer.save_dir, "weights", w)
    if src.exists():
        shutil.copy2(src, PT_DIR / w)
        logging.info("✓ copied %s → %s", w, PT_DIR)

logging.info("✓ Finished – expect ~0.98-0.99 mAP@0.50; "
             "run will terminate early if no further gains.")
