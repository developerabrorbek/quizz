const http = require("node:http");
const path = require("node:path");
const fs = require("node:fs");
const { readFileCustom, writeFileCustom } = require("./helpers/functions");

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  const method = req.method;
  const urls = req.url.split("/");

  const filePath = path.resolve("./data/cars.json");
  const cars = readFileCustom(filePath);

  if (method === "GET") {
    if (urls[1] == "cars") {
      res.statusCode = 200;
      res.end(JSON.stringify(cars));
      return;
    }

    const publicFolderPath = path.join(process.cwd(), "public");
    const mimeTypes = {
      ".html": "text/html",
      ".css": "text/css",
      ".jpg": "image/jpeg",
      ".mp4": "video/mp4",
    };

    const filePath = path.join(
      publicFolderPath,
      req.url === "/" ? "index.html" : req.url
    );

    if (!fs.existsSync(filePath)) {
      res.writeHead(404, {
        "content-type": "text/html",
      });
      res.end("<h1>Source not found</h1>");
      return;
    }

    res.writeHead(200, {
      "content-type": mimeTypes[path.extname(filePath)] || "text/plain",
    });

    // HTML faylga ma'lumotni qo'shib jo'natish
    if (filePath.split("/").at(-1) === "index.html") {
      let file = fs.readFileSync(filePath, "utf-8");
      let cars = readFileCustom("./data/cars.json");
      
      let content = "";
      cars.forEach((c) => {
        content += `
          <li>
            ${c.name} - ${c.price}
          </li>
        `;
      });
      file = file.replace("{{CARS}}", content);
      res.end(file);
      return;
    }

    let fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
    return;
  }

  if (method === "POST") {
    if (urls[1] === "cars") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", () => {
        const { name, price } = JSON.parse(body);
        const newCar = {
          id: cars.at(-1)?.id + 1 || 1,
          name,
          price,
        };

        cars.push(newCar);

        writeFileCustom(filePath, cars);
      });

      res.statusCode = 201;
      res.end(
        JSON.stringify({
          message: "Car created!",
        })
      );
      return;
    }
  }

  if (method === "PATCH") {
    if (urls[1] == "cars") {
      if (urls[2] && Number(urls[2])) {
        const carId = Number(urls[2]);
        const foundedCar = cars.find((cr) => cr.id === carId);
        const carIndex = cars.findIndex((cr) => cr.id === carId);

        if (!foundedCar) {
          res.statusCode = 404;
          res.end(
            JSON.stringify({
              message: "Car not found",
            })
          );
          return;
        }

        let body = "";

        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", () => {
          const { name, price } = JSON.parse(body);
          const updatedCar = {
            id: foundedCar.id,
            name: name || foundedCar.name,
            price: price || foundedCar.price,
          };

          cars[carIndex] = updatedCar;

          writeFileCustom(filePath, cars);
        });

        res.statusCode = 200;
        res.end(
          JSON.stringify({
            message: "Car updated!",
          })
        );
        return;
      }
    }
  }

  if (method === "PUT") {
    try {
      if (urls[1] == "cars") {
        if (urls[2] && Number(urls[2])) {
          const carId = Number(urls[2]);
          const foundedCar = cars.find((cr) => cr.id === carId);
          const carIndex = cars.findIndex((cr) => cr.id === carId);

          if (!foundedCar) {
            res.statusCode = 404;
            res.end(
              JSON.stringify({
                message: "Car not found",
              })
            );
            return;
          }

          let body = "";

          req.on("data", (chunk) => {
            body += chunk.toString();
          });

          req.on("end", () => {
            const { name, price } = JSON.parse(body);
            if (!(name && price)) {
              throw new Error("invalid name or price");
            }
            const updatedCar = {
              id: foundedCar.id,
              name,
              price,
            };

            cars[carIndex] = updatedCar;

            writeFileCustom(filePath, cars);
          });

          res.statusCode = 200;
          res.end(
            JSON.stringify({
              message: "Car updated!",
            })
          );
          return;
        }
      }
    } catch (error) {
      res.statusCode = 400;
      res.end(JSON.stringify({ message: error.message }));
      return;
    }
  }

  if (method === "DELETE") {
    if (urls[1] === "cars") {
      if (urls[2] && Number(urls[2])) {
        let carId = Number(urls[2]);
        const carIndex = cars.findIndex((car) => car.id == carId);

        if (carIndex == -1) {
          res.statusCode = 404;
          res.end(
            JSON.stringify({
              message: "Car not found",
            })
          );
          return;
        }

        cars.splice(carIndex, 1);

        writeFileCustom(filePath, cars);

        res.statusCode = 204;
        res.end();
        return;
      }
    }
  }

  res.statusCode = 404;
  res.end(
    JSON.stringify({
      message: `Given URL: ${req.url} not found`,
    })
  );
  return;
});

server.listen(3000, () => {
  console.log("Server is running on 3000");
});