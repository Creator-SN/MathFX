git add -A
yarn config set version-git-message "Auto Release: v%s "
yarn version --patch
git push
git push --tags