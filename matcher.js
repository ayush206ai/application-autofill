const rules = {
  first: ["first name", "given name"],
  last: ["last name", "family name", "surname"],
  email: ["email", "email address", "e mail address"],
  github: ["github username", "github handle"],
  repo: ["github repository url", "repository url", "repo url", "project repository url"],
  portfolio: ["portfolio", "portfolio url", "personal website", "link to your work"],
  summary: ["project summary", "project description", "describe your project"],
};

export function matchField(labels) {
  // The first meaningful label wins. An unknown visible label must not fall
  // through to a generic internal name such as "email".
  const label = labels.find((value) => value.trim());
  if (!label) return undefined;
  const normalized = label.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return Object.keys(rules).find((key) => rules[key].includes(normalized));
}
