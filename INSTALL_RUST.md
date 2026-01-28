# Installing Rust and Cargo

This guide explains how to install Rust and Cargo on your system.

## Quick Installation (Recommended)

### macOS / Linux

Run this command in your terminal:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

This will:
1. Download and run `rustup-init.sh`
2. Install Rust and Cargo to `~/.cargo/bin`
3. Add Rust to your PATH

After installation, restart your terminal or run:
```bash
source ~/.cargo/env
```

### Verify Installation

Check that Rust and Cargo are installed:

```bash
rustc --version
cargo --version
```

You should see output like:
```
rustc 1.75.0 (82e1608df 2023-12-21)
cargo 1.75.0 (1d8b05cdd 2023-11-20)
```

## Alternative Installation Methods

### Using Homebrew (macOS)

```bash
brew install rust
```

### Using Package Managers

**macOS (Homebrew):**
```bash
brew install rust
```

**Linux (apt):**
```bash
sudo apt update
sudo apt install rustc cargo
```

**Linux (yum/dnf):**
```bash
sudo dnf install rust cargo
```

## Post-Installation

### Update Rust

Keep Rust updated:
```bash
rustup update
```

### Install Additional Components

For contract development, you may need:

```bash
# Install Rustfmt (code formatter)
rustup component add rustfmt

# Install Clippy (linter)
rustup component add clippy

# Install Soroban CLI (for Stellar smart contracts)
cargo install soroban-cli --locked
```

## Troubleshooting

### PATH Issues

If `cargo` or `rustc` are not found after installation:

1. Add to your shell profile (`~/.zshrc` or `~/.bash_profile`):
   ```bash
   export PATH="$HOME/.cargo/bin:$PATH"
   ```

2. Reload your shell:
   ```bash
   source ~/.zshrc  # or source ~/.bash_profile
   ```

### Permission Issues

If you get permission errors, ensure `~/.cargo/bin` is in your PATH and has correct permissions.

### Uninstall Rust

To completely remove Rust:

```bash
rustup self uninstall
```

## Next Steps

After installing Rust:

1. **Test the installation:**
   ```bash
   cargo --version
   ```

2. **Run contract tests:**
   ```bash
   ./test-local.sh --contract
   ```

3. **Build the contract:**
   ```bash
   cd contract
   cargo build
   cargo test
   ```

## Resources

- [Official Rust Installation Guide](https://www.rust-lang.org/tools/install)
- [Rust Book](https://doc.rust-lang.org/book/)
- [Cargo Book](https://doc.rust-lang.org/cargo/)
