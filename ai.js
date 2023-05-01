let brain;
let trainer;
let num_inputs;
let num_actions;
let num_states;
let opt;
let death;
let neuronActivation = document.querySelector("#neuronActivation");

function aiDoStuff(ape) {
    console.log(parseInt(ape.style.left));
    num_actions = parseInt(width) * parseInt(height); // Number of Tiles
    num_inputs = num_actions * 2;
    let temporal_window = 1; // how many steps AI is looking at, at the same time
    let network_size = num_inputs * temporal_window + num_actions * temporal_window + num_inputs;
    let layer_defs = [];
    layer_defs.push({ type: 'input', out_sx: 1, out_sy: 1, out_depth: network_size });
    layer_defs.push({ type: 'fc', num_neurons: num_actions, activation: 'relu' });
    layer_defs.push({ type: 'fc', num_neurons: 2, activation: 'relu' });
    layer_defs.push({ type: 'regression', num_neurons: num_actions });

    let tdtrainer_options = { learning_rate: 0.001, momentum: 0.0, batch_size: 20, l2_decay: 0.01 };

    opt = {};
    opt.temporal_window = temporal_window;
    opt.experience_size = 50000;
    opt.start_learn_threshold = 300;
    opt.gamma = 0.7;
    opt.learning_steps_total = 100000;
    opt.learning_steps_burnin = 3000;
    opt.epsilon_min = 0.01;
    opt.epsilon_test_time = 0.01;
    opt.layer_defs = layer_defs;
    opt.tdtrainer_options = tdtrainer_options;

    brain = new deepqlearn.Brain(num_inputs, num_actions, opt);
    trainer = new convnetjs.Trainer(net, { method: 'adadelta', l2_decay: 0.001, batch_size: 10 });

    // brain.epsilon_test_time = 0.0; // don't make any random choices, ever
    brain.learning = true;
    // brain.experience = getExperience();
    // brain.value_net = getValueNet();

    ape.style.borderStyle = "solid";
    ape.style.borderColor = "yellow";
    ape.style.borderWidth = "thick";
    // let div = document.createElement("div")
    // div.innerHTML = "Neurons activated";
    // div.style.position = "absolute";
    // if (!Number.isNaN(parseInt(ape.style.left))) {
    //     div.style.left = parseInt(ape.style.left) + 310 + "px";
    //     console.log(div.style.left)
    // } else {
    //     div.style.left = 310 + "px";
    // }
    // div.style.top = "210px";
    // document.body.appendChild(div)
    console.log("Neurons activated");
}


function updateLoop() {
    if (document.getElementById("death").innerHTML != "" || winnerBool) {
        createGrid();
    }

    let state = new convnetjs.Vol(1, 1, aiArray);
    let action = brain.forward(state);

    
    let element = document.getElementById(action);
    let reward;

    let xy = [Math.floor((action) / 10), (action) % 10];
    if (aiArray[action] == -1) {
        if (solutionArr[xy[0]][xy[1]] == "🟐") {
            // Guess was a bomb / Game Over
            reward = -1;
        } else if (aiArray[action - 1] == -1 && aiArray[action + 1] == -1 && aiArray[action - parseInt(width)] == -1 && aiArray[action + parseInt(width)] == -1) {
            // Random Guess
            reward = -0.3;
        } else {
            // Progress
            reward = 0.3;
        }
    } else {
        // Tile is alreday showing
        reward = -0.05;
    }
    if (winnerBool) {
        // Game Won
        reward = 10;
    }
    clickTile(element);
    
    brain.backward(reward);
    
    document.getElementById("age").innerHTML = "Age = " + brain.age;
    document.getElementById("learningSum").innerHTML = "learningSum = " + brain.average_reward_window.sum;
    // if (element.innerHTML == "🟐") {
    //     setTimeout(createGrid, 50);
    // } 

    // network outputs all of its parameters into json object
    // the entire object is now simply string. You can save this somewhere
    // let json = brain.value_net.toJSON();
    // let str = JSON.stringify(json);
    // console.log(str);


    // later, to recreate the network:
    // let json = JSON.parse(str); // creates json object out of a string
    // let net2 = new convnetjs.Net(); // create an empty network
    // net2.fromJSON(json); // load all parameters from JSON
}