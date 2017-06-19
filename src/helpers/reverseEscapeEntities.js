function reverseEscapeEntities(str) {
  var entitiesMap = {
    '<': '<',
    '>': '>',
    '&': '&',
    '\\"': '\"',
    "'": "'"
  };
  return str.replace(/<|>|&|\\"|'/g, function (key) {
    return entitiesMap[key];
  });
}

export default reverseEscapeEntities;
