#!/bin/bash
grunt apidoc
( cd apidoc
  git init
  git add .
  git commit -m "Deployed to Github Pages"
  git push --force --quiet "git@github.com:martin-liu/m-sails.git" master:gh-pages
)
