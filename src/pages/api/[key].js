import Template from "@/data/template.json"
import Subscriptions from "@/data/subscriptions.json"
import * as Clash from "@/utils/parser/clash"
import * as Singbox from "@/utils/parser/singbox"

const Structure = [ "log", "dns", "ntp", "inbounds", "outbounds", "route", "experimental" ]

function applyFilter(nodes, regex) {
  const filter = new RegExp(regex.toString())
  return nodes.filter(v => filter.test(v["tag"].toString()))
}

function useFilter(outbound, subs) {
  /** Modes
   * 1. use: [ "sub_name" ]
   * 2. use: [ { "sub_name": "filter_regex" } ]
   */
  if (! (outbound["type"] == "selector" && outbound.hasOwnProperty("use") && Array.isArray(outbound["use"])))
    return outbound

  let nodes = []
  outbound["use"].forEach(v => {
    switch (typeof v) {
      case "string":
        if (subs.hasOwnProperty(v))
          nodes = nodes.concat(subs[v])
        break;

      case "object":
        let sub = Object.keys(v)[0]
        if (subs.hasOwnProperty(sub)) {
          const filteredNodes = applyFilter(subs[sub], v[sub])
          nodes = nodes.concat(filteredNodes)
        }
        break;
    }
  })
  if (outbound.hasOwnProperty("filter")) {
    nodes = applyFilter(nodes, outbound["filter"])
    delete outbound["filter"]
  }
  if (! (outbound.hasOwnProperty("outbounds") && Array.isArray(outbound["outbounds"])))
    outbound["outbounds"] = []
  nodes = nodes.filter(v => v.type != "shadowtls")
  nodes = nodes.map(v => v.tag)
  outbound["outbounds"] = outbound["outbounds"].concat(nodes)
  delete outbound["use"]
  return outbound
}

function parseOutbounds(subs) {
  let outbounds = []
  if (Template.hasOwnProperty("outbounds") && Array.isArray(Template["outbounds"]))
    outbounds = Template["outbounds"].map(outbound => useFilter(outbound, subs))

  for (const nodes of Object.values(subs))
    outbounds = outbounds.concat(nodes)
  return outbounds
}

export default async function handler(req, res) {
  let subs = {}
  for (const [name, sub] of Object.entries(Subscriptions)) {
    switch (sub["type"]) {
      case "nodes":
        subs[name] = sub["nodes"]
        break
      case "sing-box":
        subs[name] = await Singbox.get(sub["uri"])
        break
      case "clash":
        subs[name] = await Clash.get(sub["uri"])
        break
    }
  }

  let result = {}
  for (const [n, v] of Object.entries(Template))
    if (Structure.includes(n))
      result[n] = v
  result["outbounds"] = parseOutbounds(subs)

  res
    .status(200)
    .send(JSON.stringify(result, null, 2))
}
