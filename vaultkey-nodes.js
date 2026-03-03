const axios = require('axios');

module.exports = function(RED) {

    function MasterKeyNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', async function(msg) {
            msg.secret = msg.secret || {};
            const items = config.items || [];
            const projectId = config.projectId || "jasongpt";

            try {
                node.status({ fill: "blue", shape: "ring", text: "JIT Auth..." });
                const authRes = await axios.get(
                    'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',
                    { headers: { 'Metadata-Flavor': 'Google' }, timeout: 4000 }
                );
                const accessToken = authRes.data.access_token;

                for (const item of items) {
                    if (!item.n) continue;
                    if (item.t === "auth") {
                        msg.secret[item.n] = accessToken;
                    } else if (item.t === "secret") {
                        const res = await axios.get(
                            `https://secretmanager.googleapis.com/v1/projects/${projectId}/secrets/${item.n}/versions/latest:access`,
                            { headers: { "Authorization": `Bearer ${accessToken}` } }
                        );
                        msg.secret[item.n] = Buffer.from(res.data.payload.data, 'base64').toString('utf-8');
                    }
                }
                node.status({ fill: "green", shape: "dot", text: "Keys ready" });
                node.send(msg);
            } catch (err) {
                node.status({ fill: "red", shape: "dot", text: "Auth Error" });
                node.error(err.message, msg);
            }
        });
    }

    function BurnerNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on('input', function(msg) {
            delete msg.secret;
            node.status({ fill: "red", shape: "dot", text: "Burned" });
            node.send(msg);
        });
    }

    RED.nodes.registerType("gf-master-key", MasterKeyNode);
    RED.nodes.registerType("gf-burner", BurnerNode);
};
