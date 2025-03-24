#![no_main]
sp1_zkvm::entrypoint!(main);

pub fn main() {
    let final_score: u32 = sp1_zkvm::io::read();

    sp1_zkvm::io::commit(&final_score);
}
