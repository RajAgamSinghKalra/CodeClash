#!/usr/bin/env python3
"""
train.py – Minimal-logging YOLOv8 training script
────────────────────────────────────────────────
• Saves best/last checkpoints to:
      /media/agam/Local Disk/codeclash/train/pt
• Writes a concise log to:
      /media/agam/Local Disk/codeclash/train/log/train.log
• Uses ROCm GPU-0 (AMD RX 6800 XT) with AMP for speed.
"""

import os, sys, shutil, logging, argparse
from ultralytics import YOLO

# --------------------------------------------------------------------------- #
#  Output locations                                                           #
# --------------------------------------------------------------------------- #
BASE_DIR = "/media/agam/Local Disk/codeclash/train"
PT_DIR   = os.path.join(BASE_DIR, "pt")
LOG_DIR  = os.path.join(BASE_DIR, "log")
os.makedirs(PT_DIR,  exist_ok=True)
os.makedirs(LOG_DIR, exist_ok=True)

# --------------------------------------------------------------------------- #
#  Logging                                                                    #
# --------------------------------------------------------------------------- #
LOG_FILE = os.path.join(LOG_DIR, "train.log")
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.FileHandler(LOG_FILE, mode="w"),
              logging.StreamHandler(sys.stdout)]
)
logging.info("=== YOLOv8 training script started ===")

# --------------------------------------------------------------------------- #
#  CLI arguments                                                              #
# --------------------------------------------------------------------------- #
ap = argparse.ArgumentParser(description="YOLOv8 trainer (concise logging)")
ap.add_argument("--epochs",    type=int,   default=100)
ap.add_argument("--batch",     type=int,   default=-1)
ap.add_argument("--imgsz",     type=int,   default=640)
ap.add_argument("--mosaic",    type=float, default=0.1)
ap.add_argument("--optimizer", type=str,   default="AdamW")
ap.add_argument("--momentum",  type=float, default=0.937)
ap.add_argument("--lr0",       type=float, default=0.001)
ap.add_argument("--lrf",       type=float, default=0.0001)
ap.add_argument("--patience",  type=int,   default=25)
ap.add_argument("--single_cls",action="store_true")
args = ap.parse_args()

logging.info(
    f"Parameters: epochs={args.epochs}, batch={args.batch}, imgsz={args.imgsz}, "
    f"mosaic={args.mosaic}, opt={args.optimizer}, lr0={args.lr0}, lrf={args.lrf}, "
    f"momentum={args.momentum}, patience={args.patience}, single_cls={args.single_cls}"
)

# --------------------------------------------------------------------------- #
#  Dataset YAML                                                               #
# --------------------------------------------------------------------------- #
DATA_YAML = "/home/agam/Downloads/Hackathon_Dataset/HackByte_Dataset/yolo_params.yaml"

# --------------------------------------------------------------------------- #
#  Train                                                                      #
# --------------------------------------------------------------------------- #
try:
    script_dir = os.path.dirname(__file__)
    model = YOLO(os.path.join(script_dir, "yolov8s.pt"))

    _ = model.train(
        data=DATA_YAML,
        epochs=args.epochs,
        batch=args.batch,
        imgsz=args.imgsz,
        device=0,
        optimizer=args.optimizer,
        lr0=args.lr0,
        lrf=args.lrf,
        momentum=args.momentum,
        mosaic=args.mosaic,
        single_cls=args.single_cls,
        patience=args.patience,
        save=True,
        plots=False,
        project=BASE_DIR,
        name="yolo_run",
        exist_ok=True,
        workers=max(os.cpu_count() - 2, 1),
        amp=True
    )

    # ---------------------------- Post-processing --------------------------- #
    trainer      = model.trainer
    finished_at  = trainer.epoch + 1
    early_stopped = finished_at < args.epochs
    logging.info(
        f"Training completed after {finished_at} epoch(s). "
        + ("[EARLY STOP]" if early_stopped else "[FULL RUN]")
    )

    save_dir = trainer.save_dir
    run_wdir = os.path.join(save_dir, "weights")
    best_pt  = os.path.join(run_wdir, "best.pt")
    last_pt  = os.path.join(run_wdir, "last.pt")

    if os.path.exists(best_pt):
        shutil.copy2(best_pt, os.path.join(PT_DIR, "best.pt"))
        logging.info(f"Saved best.pt → {PT_DIR}")
    if os.path.exists(last_pt):
        shutil.copy2(last_pt, os.path.join(PT_DIR, "last.pt"))
        logging.info(f"Saved last.pt → {PT_DIR}")

    logging.info("=== YOLOv8 training script finished successfully ===")

except Exception as exc:
    logging.error("Training failed!", exc_info=True)
    sys.exit(1)
