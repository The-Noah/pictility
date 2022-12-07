import os
from datetime import datetime

path = "C:\\Users\\noah\\AppData\\Local\\Temp\\Lightroom"
to_path = "C:\\Users\\noah\\Pictures\\Photography"

destination_directories = os.listdir(to_path)

for entry in os.scandir(path):
    if not entry.is_file() or not entry.name.endswith(".CR2"):
      continue

    date = datetime.fromtimestamp(entry.stat().st_mtime).date()

    # find destination directory that starts with the year
    destination_directory = next((x for x in destination_directories if x.startswith("{}-{}-{}".format(str(date.year), str(date.month), str(date.day)))), None)

    if destination_directory is None:
        print("Destination directory not found!")
        continue

    new_path = os.path.join(to_path, destination_directory, "Canon Rebel T7", "1. RAW")

    if not os.path.exists(new_path):
        print("Destination directory not found!")
        continue

    # move .xmp file
    xmp_file = entry.name.replace(".CR2", ".xmp")
    xmp_path = os.path.join(path, xmp_file)
    xmp_new_path = os.path.join(new_path, xmp_file)

    if not os.path.exists(xmp_path):
        print(".xmp not found!")
        continue

    print("Moving {} to {}".format(xmp_file, destination_directory))

    # delete existing .xmp file
    if os.path.exists(xmp_new_path):
        os.remove(xmp_new_path)

    os.rename(xmp_path, xmp_new_path)
    os.remove(entry.path)
