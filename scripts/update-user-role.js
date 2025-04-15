const { MongoClient, ObjectId } = require("mongodb"); 

async function updateUserRole() {
  const uri = "mongodb://localhost:27017";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log("MongoDB bağlantısı kuruldu");
    
    const email = process.argv[2];
    const newRole = process.argv[3];
    
    if (!email || !newRole) {
      console.error("Kullanım: node update-user-role.js <email> <role>");
      return;
    }
    
    console.log(`${email} kullanıcısının rolü ${newRole} olarak güncelleniyor...`);
    
    const db = client.db("tasiapp");
    const usersCollection = db.collection("users");
    
    // Kullanıcıyı bul
    const user = await usersCollection.findOne({ email });
    
    if (!user) {
      console.error(`${email} e-posta adresine sahip kullanıcı bulunamadı`);
      return;
    }
    
    console.log(`Kullanıcı bulundu: ${user.name}`);
    
    // Kullanıcı rolünü güncelle
    const result = await usersCollection.updateOne(
      { _id: user._id },
      { $set: { role: newRole } }
    );
    
    if (result.modifiedCount === 1) {
      console.log(`${email} kullanıcısının rolü başarıyla ${newRole} olarak güncellendi`);
    } else {
      console.log(`Rol güncellemesi yapılmadı. Kullanıcı zaten ${newRole} rolüne sahip olabilir.`);
    }
  } catch (error) {
    console.error("Hata:", error);
  } finally {
    await client.close();
    console.log("MongoDB bağlantısı kapatıldı");
  }
}

updateUserRole(); 