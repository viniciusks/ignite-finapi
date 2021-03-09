const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const customers = [];

app.get("/account", (req, res) => {
    return res.json(customers);
});

// Accounts
app.post('/account', (req, res) => {
    const { cpf, name } = req.body;

    const customersAlreadyExists = customers.some((customer) => customer.cpf == cpf);

    const id = uuidv4();

    if(!customersAlreadyExists) {
        customers.push({
            id: id,
            cpf: cpf,
            name: name,
            statement: []
        });
        return res.status(201).json({
            status: 201,
            message: "Create successfully"
        });
    }

    return res.status(400).json({
        status: 400,
        message: "Bad Request"
    })

});

app.listen(3333, () => {
    console.log("Server is running!");
});