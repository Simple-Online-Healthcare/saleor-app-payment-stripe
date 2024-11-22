cd /code/
mkdir -p /code/mntvolumes
ln -s /code/mntvolumes/.saleor-app-auth.json /code/.saleor-app-auth.json 2>/dev/null
pnpm start