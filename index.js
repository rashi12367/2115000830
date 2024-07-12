const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();

let numberWindow = [];
const WINDOW_SIZE = parseInt(process.env.WINDOW_SIZE) || 10;

 async function fetchNumbers(type) {
    try {
        const response = await axios.get(`${process.env.ENDPOINT}/test/${type}`, {
            headers: {
                'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`
            },
            timeout: 500
        });
        return response.data.numbers;
    } catch (error) {
        console.error('Error fetching numbers:', error.message);
        return [];
    }
}

 function updateWindow(newNumbers) {
    newNumbers.forEach(num => {
        if (!numberWindow.includes(num)) {
            if (numberWindow.length >= WINDOW_SIZE) {
                numberWindow.shift();   
            }
            numberWindow.push(num);   
        }
    });
}

function calculateAverage() {
    const sum = numberWindow.reduce((acc, num) => acc + num, 0);
    return numberWindow.length ? (sum / numberWindow.length).toFixed(2) : 0;
}
app.get('/', (req, res) => {
    res.send('Server is up and running!');
});
app.get('/numbers/:id', async (req, res) => {
    const { id } = req.params;
    const validIds = ['p', 'f', 'e', 'r'];
    
    if (!validIds.includes(id)) {
        return res.status(400).json({ msg: "Please provide a valid id!" });
    }

    const typeMap = {
        'p': 'primes',
        'f': 'fibo',
        'e': 'even',
        'r': 'rand'
    };

    const typeOfNumbers = typeMap[id];

    try {
        const previousState = [...numberWindow];
        const newNumbers = await fetchNumbers(typeOfNumbers);
        updateWindow(newNumbers);
        const currentState = [...numberWindow];
        const average = calculateAverage();

        res.status(200).json({
            numbers: newNumbers,
            windowPrevState: previousState,
            windowCurrState: currentState,
            avg: parseFloat(average)
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ msg: "An error occurred while fetching numbers." });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});