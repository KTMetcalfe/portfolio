#!/bin/bash

echo Uploading build files...
rsync -q -avzhP --no-p ./build/* root@10.0.0.10:/mnt/user/www
echo Client build uploaded.

echo Your portfolio has been updated!
