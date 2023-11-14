#!/usr/bin/env bash

set -o errexit

yarn copy-contracts
yarn transpile

