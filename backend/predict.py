from ultralytics import YOLO
from pathlib import Path
import cv2
import os
import yaml
import torch


# Function to predict and save images
def predict_and_save(model, image_path, output_path, output_path_txt):
    # Perform prediction
    results = model.predict(image_path,conf=0.5)

    result = results[0]
    # Draw boxes on the image
    img = result.plot()  # Plots the predictions directly on the image

    # Save the result
    cv2.imwrite(str(output_path), img)
    # Save the bounding box data
    with open(output_path_txt, 'w') as f:
        for box in result.boxes:
            # Extract the class id and bounding box coordinates
            cls_id = int(box.cls)
            x_center, y_center, width, height = box.xywh[0].tolist()
            
            # Write bbox information in the format [class_id, x_center, y_center, width, height]
            f.write(f"{cls_id} {x_center} {y_center} {width} {height}\n")


if __name__ == '__main__': 

    this_dir = Path(__file__).parent
    os.chdir(this_dir)
    with open(this_dir / 'yolo_params.yaml', 'r') as file:
        data = yaml.safe_load(file)
        if 'test' in data and data['test'] is not None:
            images_dir = Path(data['test']) / 'images'
        else:
            print("No test field found in yolo_params.yaml, please add the test field with the path to the test images")
            exit()
    
    # check that the images directory exists
    if not images_dir.exists():
        print(f"Images directory {images_dir} does not exist")
        exit()

    if not images_dir.is_dir():
        print(f"Images directory {images_dir} is not a directory")
        exit()
    
    if not any(images_dir.iterdir()):
        print(f"Images directory {images_dir} is empty")
        exit()

    # Load the YOLO model
    detect_path = this_dir / "runs" / "detect"
    train_folders = []
    if detect_path.exists():
        train_folders = [
            f for f in os.listdir(detect_path)
            if (detect_path / f).is_dir() and f.startswith("train")
        ]

    if not train_folders:
        raise ValueError("No training folders found")
    idx = 0
    if len(train_folders) > 1:
        choice = -1
        choices = list(range(len(train_folders)))
        while choice not in choices:
            print("Select the training folder:")
            for i, folder in enumerate(train_folders):
                print(f"{i}: {folder}")
            choice = input()
            if not choice.isdigit():
                choice = -1
            else:
                choice = int(choice)
        idx = choice

    model_path = detect_path / train_folders[idx] / "weights" / "best.pt"
    model = YOLO(model_path)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model.to(device)

    # Directory with images
    output_dir = this_dir / "predictions" # Replace with the directory where you want to save predictions
    output_dir.mkdir(parents=True, exist_ok=True)

    # Create images and labels subdirectories
    images_output_dir = output_dir / 'images'
    labels_output_dir = output_dir / 'labels'
    images_output_dir.mkdir(parents=True, exist_ok=True)
    labels_output_dir.mkdir(parents=True, exist_ok=True)

    # Iterate through the images in the directory
    for img_path in images_dir.glob('*'):
        if img_path.suffix not in ['.png', '.jpg']:
            continue
        output_path_img = images_output_dir / img_path.name  # Save image in 'images' folder
        output_path_txt = labels_output_dir / img_path.with_suffix('.txt').name  # Save label in 'labels' folder
        predict_and_save(model, img_path, output_path_img, output_path_txt)

    print(f"Predicted images saved in {images_output_dir}")
    print(f"Bounding box labels saved in {labels_output_dir}")
    data = this_dir / 'yolo_params.yaml'
    print(f"Model parameters saved in {data}")
    metrics = model.val(data=data, split="test")
