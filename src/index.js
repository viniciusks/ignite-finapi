const { request } = require('express');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const customers = [];

// Middleware
function verifyExistsAccountCPF(req, res, next) {
    const { cpf } = req.headers;

    const customer = customers.find((customer) => customer.cpf === cpf);

    if(!customer) {
        return res.status(400).json({
            status_code: 400,
            message: "Customer not found"
        });
    }

    request.customer = customer;

    return next();
}

// Accounts
app.get("/account", (req, res) => {
    return res.json(customers);
});

app.post('/account', (req, res) => {
    const { cpf, name } = req.body;

    const customersAlreadyExists = customers.some((customer) => customer.cpf == cpf);

    if(!customersAlreadyExists) {
        customers.push({
            id: uuidv4(),
            cpf: cpf,
            name: name,
            statement: []
        });
        return res.status(201).json({
            status_code: 201,
            message: "Create successfully"
        });
    }

    return res.status(400).json({
        status_code: 400,
        message: "Bad Request - Customer already exists!"
    })

});

// Statements
app.get("/statement", verifyExistsAccountCPF, (req, res) => {
    const { customer } = req;

    return res.json(customer.statement);
});

// Deposit
app.post("/deposit", verifyExistsAccountCPF, (req, res) => {
    const { description, amount } = req.body;
    const { customer } = req;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    };

    customer.statement.push(statementOperation);

    return res.status(201).json({
        status_code: 201,
        message: "Deposit success"
    });
})

app.listen(3333, () => {
    console.log("Server is running!");
});