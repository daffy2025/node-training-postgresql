let errorHandler = (res, headers, code, st, msg) => {
    res.writeHead(code, headers);
    res.write(JSON.stringify({
      status: st,
      message: msg
    }));
    res.end();
}
module.exports = errorHandler;