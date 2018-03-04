func main(args: [String:Any]) -> [String:Any] {
    if let messages = args["messages"] as? [Any],
        let first = messages[0] as? [String: Any],
        let firstValue = first["value"] as? [String: Any]
    {
        var cats = [[String: Any]]()
        for i in 0 ..< messages.count {
            if let msg = messages[i] as? [String: Any],
                let value = msg["value"] as? [String: Any],
                let JSONCats = value["cats"] as? [Any]
            {
                for j in 0 ..< JSONCats.count {
                    if let cat = JSONCats[j] as? [String: Any] {
                        print("A \(cat["color"]) cat named \(cat["name"]) was received." )
                        cats.append(cat)
                    }
                }
            }
        }

        return [ "cats": cats ]
    } else {
        return [ "error": "Invalid arguments. Must include 'messages' JSON array with 'value' field"]
    }
}
