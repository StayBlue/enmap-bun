---
description: >-
  To install Enmap Bun, make sure Bun is installed first, then add the package to your project.
---

# Enmap Bun Installation

Enmap Bun is a wrapper around `bun:sqlite`, so the key prerequisite is a current Bun installation.

## Pre-Requisites

{% hint style="warning" %}
Bun support is required for this fork. Make sure Bun is installed and available in your shell before continuing. You can verify this with `bun --version`.
{% endhint %}

Install Bun by following the official instructions for your operating system:

- https://bun.sh/docs/installation

## Installing Enmap Bun

Once Bun is installed, open a terminal in your project and install Enmap Bun with:

```text
bun add enmap-bun
```

The runtime persistence layer comes from Bun itself, so there is no `better-sqlite3` native addon build step in this fork.

If you get any errors, please see the [Troubleshooting Guide](troubleshooting-guide.md). If the guide doesn't help, open an issue on the fork repository.
