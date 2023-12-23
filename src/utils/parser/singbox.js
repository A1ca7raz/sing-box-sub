const blackListType = [ "selector", "direct", "dns" ]

export async function get(uri) {
  const res = await fetch(uri)
  const json = await res.json()
  let nodes = json["outbounds"]
  return nodes.filter(node => ! blackListType.includes(node["type"]))
}
