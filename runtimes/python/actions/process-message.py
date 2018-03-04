def main(dict):
    messages = dict.get('messages')

    if messages is None or messages[0] is None:
        return { 'error': "Invalid arguments. Must include 'messages' JSON array with 'value' field" }
    try:
        val = messages[0]['value']
    except KeyError:
        return { 'error': "Invalid arguments. Must include 'messages' JSON array with 'value' field" }

    cats = []
    for i in range(0, len(messages)):
        msg = messages[i]
        for j in range(0, len(msg['value']['cats'])):
            cat = msg['value']['cats'][j]
            print('A ', cat['color'], ' cat named ', cat['name'], ' was received.')
            cats.append(cat)

    return { 'cats': cats }
