import { topicsToNotSendToWebview } from "../constants";

let subscriptions = {};

const _getMessageObject = (id, type, topic, payload) => ({
    id: id || "",
    source: "react_native",
    destination: "webview",
    type: type || "",
    topic: topic || "",
    payload: payload || {}
});

// receives message: gets request and routes to sendMessage
export const router = (event, webviewRef) => {
    console.log("Message received from webview.", { event, webviewRef });
    let messageData = {};
    try {
        if (!event && event.nativeEvent && event.nativeEvent.data) {
            throw new Error("router(): Invalid event.");
        }
        messageData = JSON.parse(event.nativeEvent.data);
        console.log("Parsed event data.", messageData);
        publish(messageData, webviewRef.current).then(() => console.log("Router sent data for publishing."));
    } catch (error) {
        console.error("Message router() error:,", { error });
        sendMessageToWebview(messageData.id, `${messageData.type}_error`, messageData.topic, webviewRef.current, error);
    }
};

export const sendMessageToWebview = (id, type, topic, webviewRef, payload) => {
    if (!id || !type || !topic || !webviewRef) {
        throw Error(`sendMessageToWebview() error: invalid args. id: ${id}, type: ${type}, topic: ${topic}, webviewRef: ${webviewRef}, payload: ${payload} }}`);
    }
    try {
        const message = _getMessageObject(id, type, topic, payload);
        const messageDispatcher = `(function(){
                window.dispatchEvent(new MessageEvent('message', {data: ${JSON.stringify(message)}}));
                })();
                true;
        `;
        webviewRef.injectJavaScript(messageDispatcher);
        console.log("Message sent to Webview.");
    } catch (error) {
        console.error("sendMessageToWebview() error", error);
    }
};

export const subscribe = (type = "", topic = "", callback = {}) => {
    console.log("Received subscription.", { type, topic });
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
        throw Error(`publish() error: No messageData arg found.`);
    }
    if (!webviewRef) {
        throw Error(`publish() error: No webviewRef arg found.`);
    }
    const { id, type, topic, payload } = messageData;
    try {
        if (!subscriptions[type]) {
            console.log(`No subscription found for ${type}.`);
            return;
        }
        if (!subscriptions[type][topic] || subscriptions[type][topic].length < 1) {
            console.log(`No subscription found for ${type}:${topic}.`);
            return;
        }
        const subscriptionFunctions = Object.getOwnPropertySymbols(subscriptions[type][topic]);
        for (const key of subscriptionFunctions) {
            const subscriptionFunction = subscriptions[type][topic][key];
            const subscriptionResult = await subscriptionFunction(!!payload ? payload : {});
            if (!topicsToNotSendToWebview.includes(topic)) {
                sendMessageToWebview(id, type, topic, webviewRef, subscriptionResult);
            }
            console.log(`Message Router - publish(): Event published successfully.`, {
                subscriptionFunction,
                subscriptionResult
            });
        }
    } catch (error) {
        console.error("Message Router - publish() Error:", { error });
        sendMessageToWebview(id, `${type}_error`, topic, webviewRef, { message: error.message });
    }
};
