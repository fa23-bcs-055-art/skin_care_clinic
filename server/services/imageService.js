const bufferToDataUri = (buffer, mime) => {
  const base64 = buffer.toString('base64');
  return `data:${mime};base64,${base64}`;
};

module.exports = { bufferToDataUri };
