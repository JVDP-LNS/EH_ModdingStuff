import cv2
import os
import numpy as np
import json
from tkinter import Tk
from tkinter.filedialog import askopenfilename

# Function to make frames square by adding padding
def make_square(image):
    height, width = image.shape[:2]
    if height == width:
        return image
    size = max(height, width)
    square_image = cv2.copyMakeBorder(image, 
                                      (size - height) // 2, 
                                      (size - height + 1) // 2, 
                                      (size - width) // 2, 
                                      (size - width + 1) // 2, 
                                      cv2.BORDER_CONSTANT, value=[0, 0, 0])
    return square_image

# Function to replace black background with transparency
def replace_black_with_transparency(image):
    # Convert BGR image to BGRA (with an alpha channel)
    bgr = image[:, :, :3]
    alpha = np.ones(bgr.shape[:2], dtype=np.uint8) * 255  # Start with fully opaque

    # Find black pixels ([0, 0, 0]) and set alpha channel to 0 (transparent)
    black_pixels = np.all(bgr == [0, 0, 0], axis=-1)
    alpha[black_pixels] = 0

    # Combine BGR with the alpha channel
    rgba_image = np.dstack([bgr, alpha])
    return rgba_image

# Function to extract frames from video and save them as square PNG images with transparency
def extract_frames(video_path, output_folder, output_id, output_res):
    # Create output folder if it doesn't exist
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Open the video file
    cap = cv2.VideoCapture(video_path)
    frame_total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    frame_rate = cap.get(cv2.CAP_PROP_FPS)
    frame_duration = 1/frame_rate/frame_total   #makes everything fit in 1s
    print("Frame rate: " + str(frame_rate))
    frame_count = 0

    effectData = {
        "ItemType": 26,
        "Id": output_id,
        "Elements": []
    }

    while True:
        ret, frame = cap.read()
        if not ret:
            break  # Break the loop when there are no more frames
        # Make the frame square
        frame = make_square(frame)

        frame = cv2.resize(frame, (output_res, output_res))
        # Replace black background with transparency
        frame = replace_black_with_transparency(frame)

        # Save the frame as a PNG file with transparency
        frame_filename = f"{output_folder}_img{frame_count}.png"
        frame_filepath = os.path.join(output_folder, frame_filename)
        effectData["Elements"].append({
            "Type": 9,
            "Image": frame_filename,
            "ColorMode": 1, #UseMyOwn, with unspecified color -> White
            "Size": 1,
            "Lifetime": frame_duration,
            "StartTime": frame_count * frame_duration
        })
        cv2.imwrite(frame_filepath, frame)
        frame_count += 1

    effectFile = open(output_folder + "/" + output_folder+"_fx.json", 'w+')
    effectFile.write(json.dumps(effectData, indent=4))
    effectFile.close()

    cap.release()
    print(f"Extracted {frame_count} frames and saved them as square PNG files with transparency.")

# GUI to select the video file
def pick_video_file():
    root = Tk()
    root.withdraw()  # Hide the root window
    video_path = askopenfilename(filetypes=[("Video files", "*.mp4")])
    return video_path

if __name__ == "__main__":
    # Pick the video file
    video_path = pick_video_file()

    if video_path:
        fileId = int(input("ID of the generated effect file: "))
        fileName = input("Name of file: ")
        fileRes = input("Output resolution: ")
        if(not fileName):
            fileName = "mp3_to_effect_export"
        # Folder to save frames

        # Extract frames and save as PNG with transparency
        extract_frames(video_path, fileName, fileId, fileRes)
    else:
        print("No video file selected.")
