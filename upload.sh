#!/bin/bash

echo -e '\033[0;34m'Uploading build files...'\033[0m'
rsync -avzh --no-p ./build/* root@10.0.0.10:/mnt/user/www/default
echo -e '\033[0;36m'Client build uploaded.'\033[0m'

echo -e '\033[0;32m'Your portfolio has been updated!'\033[0m'