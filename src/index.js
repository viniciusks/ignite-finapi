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

function getBalance(statement) {
    const balance = statement.reduce((acc, operation) => {
        if(operation.type == "credit") {
            return acc + operation.amount;
        } else {
            return acc - operation.amount;
        }
    }, 0);

    return balance;
}

// Accounts
app.get("/account", verifyExistsAccountCPF, (req, res) => {
    const { customer } = req;

    return res.json(customer);
});

app.post("/account", (req, res) => {
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

app.put("/account", verifyExistsAccountCPF, (req, res) => {
    const { name } = req.body;
    const { customer } = req;

    customer.name = name;

    return res.status(201).json(customer.name);
});

app.delete("/account", verifyExistsAccountCPF, (req, res) => {
    const { customer } = req;

    customers.splice(customer, 1);

    return res.status(200).json(customers);
})

// Statements
app.get("/statement", verifyExistsAccountCPF, (req, res) => {
    const { customer } = req;

    return res.json(customer.statement);
});

app.get("/statement/date", verifyExistsAccountCPF, (req, res) => {
    const { customer } = req;
    const { date } = req.query;

    const dateFormat = new Date(date + " 00:00");
    console.log(customer.statement);
    const statement = customer.statement.filter((statement) => statement.created_at.toDateString() == new Date(dateFormat).toDateString());

    return res.json(statement);
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
});

// Withdraw
app.post("/withdraw", verifyExistsAccountCPF, (req, res) => {
    const { amount } = req.body;
    const { customer } = req;
    const balance = getBalance(customer.statement);

    if(balance < amount) {
        return res.status(400).json({
            status_code: 400,
            message: "Insufficient funds!"
        });
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: "debit"
    }

    customer.statement.push(statementOperation);

    return res.status(201).json({
        status_code: 201,
        message: "Withdraw success!"
    })
});

// Balance
app.get("/balance", verifyExistsAccountCPF, (req, res) => {
    const { customer } = req;

    const balance = getBalance(customer.statement);

    return res.json(balance);
})

app.listen(3333, () => {
    console.log("Server is running!");
});