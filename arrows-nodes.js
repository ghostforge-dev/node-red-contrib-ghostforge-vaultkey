module.exports = function(RED) {
    function ArrowNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function(msg) {
            node.send(msg);
        });
    }
    RED.nodes.registerType("gf-arrow-up",    ArrowNode);
    RED.nodes.registerType("gf-arrow-down",  ArrowNode);
    RED.nodes.registerType("gf-arrow-left",  ArrowNode);
    RED.nodes.registerType("gf-arrow-right", ArrowNode);
};
