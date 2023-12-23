import { parse } from 'yaml'

function shadowsocks(node) {
  return {
    tag: node["name"],
    type: "shadowsocks",
    server: node["server"],
    server_port: node["port"],
    method: node["cipher"],
    password: node["password"]
  }
}

function trojan(node) {
  return {
    tag: node["name"],
    type: "trojan",
    server: node["server"],
    server_port: node["port"],
    password: node["password"],
    tls: {
      enabled: true,
      server_name: node["sni"]
    }
  }
}

function vmess(node) {
  return {
    tag: node["name"],
    type: "vmess",
    server: node["server"],
    server_port: node["port"],
    uuid: node["uuid"],
    alter_id: node["alterId"],
    tls: {
      enabled: node["tls"],
      server_name: node["servername"]
    },
    transport: {
      type: node["network"],
      path: node["ws-path"],
      headers: node["ws-headers"]
    }
  }
}

function parser(node) {
  switch (node["type"]) {
    case "ss":
      return shadowsocks(node)
    case "trojan":
      return trojan(node)
    case "vmess":
      return vmess(node)
    default:
      console.warn("Unsupported protocol.")
  }
}

export async function get(uri) {
  const res = await fetch(uri)
  const raw = await res.text()
  const nodes = parse(raw)["proxies"]
  return nodes.map(parser)
  // return nodes
}