let subscriptions = {};

const _getUniqueId = () => {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

const _getMessageObject = (type, topic, payload) => ({
    request_id: _getUniqueId(),
    source: "react_native",
    destination: "webview",
    type: type || "",
    topic: topic || "",
    payload: payload || {}

});

// receive message: gets request and routes to sendMessage
export const router = (event, webviewRef) => {
    console.log("message received from webview", { event, webviewRef });
    let messageData = {};
    try {
        if (!event && event.nativeEvent && event.nativeEvent.data) {
            throw new Error("router(): Invalid event.");
        }
        messageData = JSON.parse(event.nativeEvent.data);
        console.log("Parsed event data", messageData);
        publish(messageData, webviewRef).then(() => console.log("Router sent data for publishing."));
    } catch (error) {
        console.error("React Native Message router() error:,", { error });
        _sendMessageToWebview(`${messageData.type}_error`, messageData.topic, webviewRef, error);
    }
};

export const _sendMessageToWebview = (type, topic, webviewRef, payload) => {
    const message = _getMessageObject(type, topic, payload);
    const messageDispatcher = `(function(){
                window.dispatchEvent(new MessageEvent('message', {data: ${JSON.stringify(message)}}));
                })();
                true;
            `;
    webviewRef.injectJavaScript(messageDispatcher);
    console.log("Message sent to Webview.");

};

export const subscribe = (type = "", topic = "", callback = {}) => {
    console.log("Received subscription", { type, topic, callback });
    const id = Symbol("id");
    if (!subscriptions[type]) {
        subscriptions[type] = {};
    }
    if (!subscriptions[type][topic]) {
        subscriptions[type][topic] = {};
    }
    if (!subscriptions[type][topic][id]) {
        subscriptions[type][topic][id] = callback;
        console.log(`Subscribed to ${type}:${topic} subscription successfully.`, { subscriptions });
    }

    return {
        unsubscribe: () => {
            delete subscriptions[type][topic][id];
            console.log("Unsubscribed from subscription successfully.");
            if (Object.getOwnPropertySymbols(subscriptions[type][topic]).length === 0) {
                delete subscriptions[type][topic];
            }
            if (!subscriptions[type]) {
                delete subscriptions[type];
            }
        }
    };
};

export const publish = async (messageData, webviewRef) => {
    if (!messageData) {
        console.log(`No messageData arg found`);
    }
    const { type, topic, payload } = messageData || {};
    try {
        if (!subscriptions[type]) {
            console.log(`No subscription found for ${type}`);
            return;
        }
        if (!subscriptions[type][topic] || subscriptions[type][topic].length < 1) {
            console.log(`No subscription found for ${type}:${topic}`);
            return;
        }
        const subscriptionFunctions = Object.getOwnPropertySymbols(subscriptions[type][topic]);
        for (const key of subscriptionFunctions) {
            const subscriptionFunction = subscriptions[type][topic][key];
            console.log({ subscriptionFunction });
            const subscriptionResult = await subscriptionFunction(!!payload ? payload : {});
            _sendMessageToWebview(type, topic, webviewRef, subscriptionResult);
            console.log(`Message Router - publish(): Event published successfully.`, { subscriptionResult });
        }
    } catch (error) {
        console.error("Message Router - publish() Error:", { error });
        _sendMessageToWebview(`${type}_error`, topic, webviewRef, error);
    }
};
