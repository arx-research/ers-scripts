#!/usr/bin/env bash

yarn clean-artifacts
mkdir contracts
cp -rf node_modules/@arx-research/ers-contracts/contracts/* ./contracts/.
mkdir artifacts
cp -rf node_modules/@arx-research/ers-contracts/artifacts/* ./artifacts/.
