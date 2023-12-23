{ pkgs ? import <nixpkgs> {} }:
with pkgs; mkShell {
  packages = [
    yarn
    nodejs
    yaml2json
  ];
}
