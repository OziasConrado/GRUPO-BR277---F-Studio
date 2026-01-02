
const admin = require('firebase-admin');

// Substitua pelo email do usuário que você quer tornar admin
const emailDoFuturoAdmin = 'placasteell@gmail.com'; 

// Carrega suas credenciais
const serviceAccount = require('./firebase-service-account.json');

// Inicializa o Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminClaim() {
  try {
    console.log(`Procurando usuário: ${emailDoFuturoAdmin}...`);
    const user = await admin.auth().getUserByEmail(emailDoFuturoAdmin);
    
    // Define a permissão 'admin: true' para o usuário
    await admin.auth().setCustomUserClaims(user.uid, { admin: true });
    
    console.log(`\n🎉 Sucesso!`);
    console.log(`O usuário ${user.email} (UID: ${user.uid}) agora é um administrador.`);
    console.log(`\n➡️ Para ver o resultado no app, faça logout e login novamente.`);

  } catch (error) {
    console.error('❌ Erro ao definir permissão de admin:', error.message);
  } finally {
    // Encerra o processo para que o terminal não fique travado
    process.exit(0);
  }
}

setAdminClaim();
