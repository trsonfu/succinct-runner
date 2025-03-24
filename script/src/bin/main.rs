use sp1_sdk::{include_elf, ProverClient, SP1Stdin, utils};
use std::env;
use sha2::{Digest, Sha256};
use bincode;
use hex;
use serde::{Deserialize, Serialize};
use actix_web::{web, App, HttpResponse, HttpServer, Responder};

const GAME_SCORE_ELF: &[u8] = include_elf!("snake-game-program");

// Struct để định dạng JSON response
#[derive(Serialize)]
struct ProofResponse {
    proof_id: String,
    cycles: u64,
    score: u32,
}

// Struct để nhận dữ liệu từ UI qua body của POST request
#[derive(Deserialize)]
struct ProofRequest {
    score: u32,
}

// Handler cho endpoint /prove
async fn generate_proof(req: web::Json<ProofRequest>) -> impl Responder {
    // Khởi tạo client và stdin
    let client = ProverClient::from_env();
    let mut stdin = SP1Stdin::new();

    // Lấy score từ body của request
    let score = req.score;
    stdin.write(&score);

    // Kiểm tra score hợp lệ
    if score == 0 {
        return HttpResponse::BadRequest().body("Error: Game score must be greater than 0.");
    }

    println!("🏆 Game Score: {}", score);

    // Tạo proof
    let (pk, vk) = client.setup(GAME_SCORE_ELF);
    let proof = match client.prove(&pk, &stdin).run() {
        Ok(proof) => {
            println!("✅ Successfully generated proof!");
            proof
        }
        Err(e) => return HttpResponse::InternalServerError().body(format!("Proof generation failed: {}", e)),
    };

    // Tính hash của proof
    let proof_bytes = bincode::serialize(&proof).expect("Failed to serialize proof");
    let mut hasher = Sha256::new();
    hasher.update(&proof_bytes);
    let proof_hash = hex::encode(hasher.finalize());

    // Xác minh proof
    if let Err(e) = client.verify(&proof, &vk) {
        return HttpResponse::InternalServerError().body(format!("Proof verification failed: {}", e));
    }
    println!("✅ Successfully verified proof!");

    // Lấy số chu kỳ
    let (_output, report) = client
        .execute(GAME_SCORE_ELF, &stdin)
        .run()
        .expect("Failed to execute program");

    // Tạo response
    let response = ProofResponse {
        proof_id: proof_hash,
        cycles: report.total_instruction_count(),
        score,
    };

    HttpResponse::Ok().json(response)
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Thiết lập logging
    utils::setup_logger();

    // Chạy trên CPU thay vì Docker
    env::set_var("SP1_PROVER", "cpu");

    println!("Starting Rust server on 127.0.0.1:8080...");

    // Chạy HTTP server
    HttpServer::new(|| {
        App::new()
            .route("/prove", web::post().to(generate_proof)) // Endpoint /prove
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await?;

    Ok(())
}