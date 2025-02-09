require("dotenv").config()
const http = require("http")
const AppDataSource = require("./db")
const errorHandler = require("./errorHandler")

const requestListener = async (req, res) => {
  const headers = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Content-Length, X-Requested-With',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'PATCH, POST, GET,OPTIONS,DELETE',
   'Content-Type': 'application/json'
  }

  let body = ""
  req.on("data", (chunk) => {
    body += chunk
  })

  if (req.url === "/api/credit-package" && req.method === "GET") {
    try {
      // 取得操作 "CreditPackage" 這個 Entity (資料表) 的所有方法
      const creditPkgRepo = AppDataSource.getRepository("CreditPackage");
      const allPkgs = await creditPkgRepo.find({
        select: ['id','name','credit_amount','price']
      });
      res.writeHead(200, headers);
      res.write(JSON.stringify({
        status: "success",
        data: allPkgs
      }));
      res.end();
    } catch {
      errorHandler(res, headers, 500, "error", "伺服器錯誤");
    }
  } else if (req.url === "/api/credit-package" && req.method === "POST") {
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);

        if (data.name === undefined || typeof(data.name) !== 'string' || data.name.trim().length === 0 ||
            data.credit_amount === undefined || typeof(data.credit_amount) !== 'number' || data.credit_amount < 0 ||
            data.price == undefined || typeof(data.price) !== 'number' || data.price < 0) {
            errorHandler(res, headers, 400, "failed", "欄位未填寫正確");
            return;
        }
        const creditPkgRepo = AppDataSource.getRepository("CreditPackage");
        const pkgName = await creditPkgRepo.find({
          where: {
            name: data.name
          }
        });
        if (pkgName.length > 0) {
          errorHandler(res, headers, 409, "failed", "資料重複");
          return;
        }q
        const newPkg = creditPkgRepo.create({
          name: data.name,
          credit_amount: data.credit_amount,
          price: data.price
        });
        const result = await creditPkgRepo.save(newPkg);
        res.writeHead(200, headers);
        res.write(JSON.stringify({
          status: "success",
          data: {
            id: result.id,
            name: result.name,
            credit_amount: result.credit_amount,
            price: result.price
          }
        }));
        res.end();
      } catch {
        errorHandler(res, headers, 500, "error", "伺服器錯誤");
      }
    });
  } else if (req.url.startsWith("/api/credit-package/:") && req.method === "DELETE") {
    try {
      const id = req.url.split(':').pop();
      if (id === undefined || id.length == 0) {
        errorHandler(res, headers, 400, "failed", "ID錯誤");
        return;
      }
      const creditPkgRepo = AppDataSource.getRepository("CreditPackage");
      let result = await creditPkgRepo.delete(id);

      if (result.affected === 0) {
        errorHandler(res, headers, 400, "failed", "ID錯誤");
        return;
      }
      res.writeHead(200, headers);
      res.write(JSON.stringify({
        status: "success"
      }));
      res.end();
    } catch {
      errorHandler(res, headers, 500, "error", "伺服器錯誤");
    }
  } else if (req.url === "/api/coaches/skill" && req.method === "GET") {
    try {
      // 取得操作 "CreditPackage" 這個 Entity (資料表) 的所有方法
      const skillRepo = AppDataSource.getRepository("Skill");
      const allSkills = await skillRepo.find({
        select: ['id','name']
      });
      res.writeHead(200, headers);
      res.write(JSON.stringify({
        status: "success",
        data: allSkills
      }));
      res.end();
    } catch {
      errorHandler(res, headers, 500, "error", "伺服器錯誤");
    }
  } else if (req.url === "/api/coaches/skill" && req.method === "POST") {
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);

        if (data.name === undefined || typeof(data.name) !== 'string' || data.name.trim().length === 0) {
            errorHandler(res, headers, 400, "failed", "欄位未填寫正確");
            return;
        }
        const skillRepo = AppDataSource.getRepository("Skill");
        const skillName = await skillRepo.find({
          where: {
            name: data.name
          }
        });
        if (skillName.length > 0) {
          errorHandler(res, headers, 409, "failed", "資料重複");
          return;
        }
        const newSkill = skillRepo.create({
          name: data.name
        });
        const result = await skillRepo.save(newSkill);
        res.writeHead(200, headers);
        res.write(JSON.stringify({
          status: "success",
          data: {
            id: result.id,
            name: result.name
          }
        }));
        res.end();
      } catch {
        errorHandler(res, headers, 500, "error", "伺服器錯誤");
      }
    });
  } else if (req.url.startsWith("/api/coaches/skill/:") && req.method === "DELETE") {
    try {
      const id = req.url.split(':').pop();
      if (id === undefined || id.length == 0) {
        errorHandler(res, headers, 400, "failed", "ID錯誤");
        return;
      }
      const skillRepo = AppDataSource.getRepository("Skill");
      let result = await skillRepo.delete(id);

      if (result.affected === 0) {
        errorHandler(res, headers, 400, "failed", "ID錯誤");
        return;
      }
      res.writeHead(200, headers);
      res.write(JSON.stringify({
        status: "success"
      }));
      res.end();
    } catch {
      errorHandler(res, headers, 500, "error", "伺服器錯誤");
    }
  } else if (req.method === "OPTIONS") {
    res.writeHead(200, headers)
    res.end()
  } else {
    errorHandler(res, headers, 404, "failed", "無此網站路由");
  }
}

const server = http.createServer(requestListener)

async function startServer() {
  await AppDataSource.initialize()
  console.log("資料庫連接成功")
  server.listen(process.env.PORT)
  console.log(`伺服器啟動成功, port: ${process.env.PORT}`)
  return server;
}

module.exports = startServer();
