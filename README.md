# Succinct Runner Game

A crypto-themed running game that integrates SP1 zero-knowledge proofs for cryptographic verification of game scores. Built with modern web technologies and the Succinct SP1 framework.

## 🎮 Game Overview

Succinct Runner is an endless runner game where players:
- Control a character that automatically runs forward
- Jump over obstacles using the SPACE key
- Collect tokens to increase their score
- Generate cryptographic proofs of their achievements using SP1

The game features:
- Modern, responsive UI with Macbook-style design
- Real-time score tracking
- Binary-style animations for proof generation
- Secure proof verification system
- Cross-platform compatibility (macOS/Linux)

## 🛠 Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js with Express
- **Zero-Knowledge Proof**: Succinct SP1
- **Game Engine**: Canvas-based rendering
- **API**: RESTful endpoints for proof generation

## 🔒 SP1 Integration

SP1 (Succinct Proof 1) is a zero-knowledge proof system that allows us to:
- Generate cryptographic proofs of game scores
- Verify scores without revealing the full game state
- Ensure fair play and prevent score manipulation
- Create trustless verification of achievements

### How SP1 Works in Our Game

1. **Game State Capture**: When a game ends, we capture the final score
2. **Proof Generation**: SP1 generates a cryptographic proof of the score
3. **Verification**: The proof can be verified without revealing the full game state
4. **Visual Feedback**: Binary-style animations during proof generation

## System Requirements

Before installation, ensure your system has:
- macOS 10.15+ or Linux (Ubuntu 20.04+ recommended)
- Node.js 14.0 or newer
- Git
- Rust (Nightly)
- Docker
- SP1 toolchain

> ⚠️ Note: This project is not compatible with Windows due to SP1 requirements.

## Installation Guide

### Step 1: Install SP1 Tools

1. Install SP1 using sp1up:
   ```bash
   curl -L https://sp1up.succinct.xyz | bash
   sp1up
   ```

2. Verify SP1 installation:
   ```bash
   sp1 --version
   ```

3. Install Rust nightly:
   ```bash
   rustup default nightly
   rustup update
   ```

### Step 2: Download Source Code

1. Clone the repository:
   ```bash
   git clone https://github.com/trsonfu/succinct-runner.git
   cd succinct-runner
   ```

### Step 3: Build SP1 Program

1. Navigate to the program directory:
   ```bash
   cd program
   ```

2. Build the program:
   ```bash
   cargo prove build
   ```

3. Run the program:
   ```bash
   cargo run
   ```

### Step 4: Install and Run Server

1. Navigate to server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```
   Server will run on port 3007

### Step 5: Access the Game

1. Open your browser
2. Visit: `http://localhost:3007`

## 🎯 Game Rules

1. Press SPACE to jump over obstacles
2. Collect tokens to increase your score
3. Avoid obstacles to stay alive
4. When game ends, generate a proof of your score
5. Share your proof with others to verify your achievement

## 🔧 Technical Details

### SP1 Program Structure

The SP1 program (`program/src/main.rs`) handles:
- Score verification
- Proof generation
- Cryptographic operations

### API Endpoints

#### Generate Proof
```
POST http://localhost:3007/api/generate-proof
Content-Type: application/json

{
    "score": number
}

Response:
{
    "proof_id": string,
    "cycles": number,
    "timestamp": string
}
```

## 🐛 Common Issues and Solutions

1. **SP1 Installation Issues**:
   - Ensure you're on macOS or Linux
   - Check Docker is running
   - Verify Rust nightly installation
   - Run `sp1 --version` to confirm installation

2. **Build Failures**:
   - Clean cargo cache: `cargo clean`
   - Update Rust: `rustup update`
   - Check SP1 version compatibility

3. **Server Issues**:
   - Check port availability
   - Verify Node.js version
   - Check npm dependencies

## 📁 Project Structure

```
succinct-runner/
├── server/                 # Node.js Server
│   ├── node_modules/      # Node.js libraries
│   ├── public/           # Static files
│   ├── css/             # CSS files
│   ├── js/              # JavaScript files
│   └── server.js        # Main server file
├── contracts/            # Smart contracts
├── program/             # SP1 program files
│   ├── src/            # Source code
│   └── Cargo.toml      # Rust dependencies
├── script/              # Script files
└── README.md           # Documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 🙏 Acknowledgments

- Succinct Labs for SP1 framework
- Game assets and inspiration from various sources
- Community contributors and testers