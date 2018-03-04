<?php
function main(array $args) : array
{
    if ((array_key_exists("messages", $args)) && !empty($args["messages"]) && array_key_exists("value", $args["messages"][0])) {
        $cats = array();

        foreach($args["messages"] as $message) {
            $value = $message["value"];
            $JSONCats = $value["cats"];
            foreach($JSONCats as $cat) {
                $color = $cat["color"];
                $name = $cat["name"];
                print("A $color cat named $name was received.");
                array_push($cats, $cat);
            }
        }

        return ["cats" => $cats];
    } else {
        return ["error" => "Invalid arguments. Must include 'messages' JSON array with 'value' field"];
    }
}
