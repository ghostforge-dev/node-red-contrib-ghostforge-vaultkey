module.exports = function(RED) {

    function GateOpenerNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const topic      = config.topic || "default";
        const contextKey = "gf_gate_status_" + topic;
        const queueKey   = "gf_gate_queue_"  + topic;

        node.on('input', function(msg) {
            const status = node.context().global.get(contextKey) || "free";

            if (status === "free") {
                node.context().global.set(contextKey, "open");
                node.status({ fill: "red", shape: "dot", text: "open: " + topic });
                node.send(msg);
            } else {
                const queue = node.context().global.get(queueKey) || [];
                queue.push(msg);
                node.context().global.set(queueKey, queue);
                node.status({ fill: "yellow", shape: "ring", text: "queue (" + queue.length + "): " + topic });
            }
        });

        node._release = function() {
            const queue = node.context().global.get(queueKey) || [];
            if (queue.length > 0) {
                const next = queue.shift();
                node.context().global.set(queueKey, queue);
                node.context().global.set(contextKey, "open");
                node.status({ fill: "red", shape: "dot", text: "open (queue " + queue.length + "): " + topic });
                node.send(next);
            } else {
                node.context().global.set(contextKey, "free");
                node.status({ fill: "green", shape: "dot", text: "free: " + topic });
            }
        };

        node.on('close', function() {
            node.context().global.set(contextKey, "free");
            node.context().global.set(queueKey, []);
        });
    }

    function GateCloserNode(config) {
        RED.nodes.createNode(this, config);
        const node    = this;
        const topic   = config.topic || "default";
        const delayMs = parseInt(config.delay) || 4000;

        node.on('input', function(msg) {
            node.status({ fill: "blue", shape: "ring", text: "closing in " + (delayMs/1000) + "s..." });

            setTimeout(function() {
                node.status({ fill: "green", shape: "dot", text: "released: " + topic });

                RED.nodes.eachNode(function(n) {
                    if (n.type === "gf-gate-opener" && n.topic === topic) {
                        const opener = RED.nodes.getNode(n.id);
                        if (opener && opener._release) {
                            opener._release();
                        }
                    }
                });

                node.send(msg);
            }, delayMs);
        });
    }

    RED.nodes.registerType("gf-gate-opener", GateOpenerNode);
    RED.nodes.registerType("gf-gate-closer", GateCloserNode);
};
