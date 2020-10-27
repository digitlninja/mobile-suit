import * as WebviewPigeon from "./index";
// jest.mock("./index", () => ({ router: () => jest.fn() }));

const fakeWebviewEvent = {
    nativeEvent: {
        canGoBack: true,
        canGoForward: false,
        data: "{\"destination\":\"react_native\",\"source\":\"webview\",\"type\":\"gps\",\"topic\":\"location_update\",\"payload\":{}}",
        loading: false,
        target: 9,
        title: "IoT Dashboard | ThreeSprints",
        url: "http://localhost:3000/users"
    }
};

const fakeParsedEvent = {
    destination: "webview",
    payload: {
        mocked: false, timestamp: 1600874150856, coords: {
            accuracy: 5,
            altitude: 5,
            heading: 0,
            latitude: 41.4219983,
            longitude: -110.084,
            speed: 0
        }
    },
    request_id: "ff5xugqd2o7kffj4x17",
    source: "react_native",
    topic: "location_update",
    type: "gps"
};

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

describe("router", () => {
    it("publishes parsed event data", () => {
        // expect.assertions(3);
        const routerSpy = jest.spyOn(WebviewPigeon, "router");
        const publishSpy = jest.spyOn(WebviewPigeon, "publish");
        const webviewRef = {};
        WebviewPigeon.router(fakeWebviewEvent, webviewRef);
        expect(routerSpy).toBeCalledTimes(1);
        // expect(publishSpy).toBeCalledTimes(1);
        expect(publishSpy).toBeCalledWith(fakeParsedEvent, webviewRef);
    });
    it("calls sendMessage to webview with an error if error occurs", async () => {
        // expect.assertions(1);
        const routerSpy = jest.spyOn(WebviewPigeon, "router");
        const sendMessageToWebViewSpy = jest.spyOn(WebviewPigeon, "sendMessageToWebview");

        const webviewRef = {};
        expect(routerSpy).toBeCalledTimes(1);
        expect(sendMessageToWebViewSpy).toBeCalledTimes(1);
        const error = new Error();
        expect(sendMessageToWebViewSpy).toBeCalledWith(`${fakeParsedEvent.type}_error`, fakeParsedEvent.topic, webviewRef, error);

        WebviewPigeon.router(fakeWebviewEvent, webviewRef);
    });
});

