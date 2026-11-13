import express from 'express';
import * as expenses from './expense_model.js'

const app = express();
app.use(express.static('public'));

app.listen(8000, () => {
    
    console.log('http://localhost:8000');
});

//IH#4: Nav bar for every page.
 const nav = `
    <link rel="stylesheet" href="/style.css">
    <nav>
        <a href="/index.html"><button>Home</button></a>
        <a href="/add.html"><button>Add Expense</button></a>
        <a href="/view/hide"><button>View Expense</button></a>
    </nav>`;

//USER STORY 1: Add an expense.
//To add in an expense for the list.
app.get('/expenses/add', async(req,res) => {

    const amount = Number(req.query.amount);
    const category = req.query.category;
    const date = req.query.date;
    const description = req.query.description;

    //an if statment to check for missing information.
    if(!amount || amount <= 0 || !category || !date){
        return res.status(400).send(`
                    ${nav}
                    <h1>Error: Invalid Input</h1>
                    <p>Please enter an amount, a category, and a date.</p>
                    <a href="/add.html">Try Again.</a>`);
    }
    else{
    const expense = await expenses.createExpense(amount, category, date, description)
    console.log('Expense added: ', expense)
    res.status(201).send(`
        ${nav}
        <h1>Add Expense</h1>
        <p>Saved, $${amount} for ${category} was added.</p>
        <a href="/add.html">Add Expense.</a>
        <a href="/view/hide">View Expense</a>`);
    }
});

//USER STORY 2: View expenses.
//To show all the expenses and the total.
app.get('/view/:details', async (req,res) => {

    const list = await expenses.getExpenses();
    const showDetails = req.params.details == 'show';

    let rows = '';
    let total = 0;

    //for loop to make rows and totals
    for(let i = 0; i < list.length; i++){

        total += list[i].amount;

        rows += `
            <tr>
                <td>${list[i].category}</td>
                <td>$${list[i].amount}</td>
                <td class="details">${list[i].date}</td>
                <td class="details">${list[i].description}</td>                
                <td><a href="/expenses/delete/${i}">Delete</a></td>
            </tr>`;
    }

    //IH#3: Show or hide details.
    let tableClass = 'hideDetails';
    let detailsLink = '<a href="/view/show">Show Details</a>';

    //An if statement to show the users if they asked.
    if(showDetails){
        tableClass = '';
        detailsLink = '<a href="/view/hide">Hide Details</a>';
    }

    //To check if there are no expenses.
    let emptyMessage = '';
    if(list.length === 0){
    
        emptyMessage = '<p>No expenses yet.</p>';
    }

    res.status(200).send(`
        ${nav}    
        <h1>View Expense</h1>
        ${emptyMessage}
        ${detailsLink}
        <table class="${tableClass}">
        <tr>
            <th>Category</th>
            <th>Amount</th>
            <th class="details">Date</th>
            <th class="details">Description</th>
            <th>Delete</th>
        </tr>
        ${rows}   
    </table>    
    <h2>Total: $${total}</h2>`);

});

//USER STORY 3: Delete Expense.
//To ask the user if they are sure about deleting it.
//IH#2 and IH8 because it shows what will be deleted and what will happen.
app.get('/expenses/delete/:index', async (req,res) => {

    const index = Number(req.params.index);
    const list = await expenses.getExpenses();
    const find = list[index];

    if(!find){

        res.status(404).send(`
            ${nav}
            <h1>Expense not found</h1>
            <a href="/view/hide">View Expenses</a>`);
    }
    else{

        res.status(200).send(`
            ${nav}
            <h1>Delete Expense?</h1>
            <p>Are you sure you want to delete this expense?</p>
            <p>${find.category} $${find.amount} (${find.date}) ${find.description}</p>
            <p>This will remove from your total. You can undo this right after</p>.
            <a href="/expenses/delete/${index}/confirm">Delete</a>
            <a href="/view/hide">Cancel</a>`);
    }
});

//User STORY 3: Delete Expense
//To delete after the user says yes.
app.get('/expenses/delete/:index/confirm', async (req,res) => {

    //To check which expense to delete.
    const index = Number(req.params.index);
    const find = await expenses.deleteExpense(index);

    //If the expense if not found then output a message.
    if(!find){

        res.status(404).send(`
            ${nav}
            <h1>Expense not found</h1>
            <a href="/view/hide">View Expenses</a>`);
    }
    //Else the expense is deleted.
    else{

        console.log('Expense deleted: ', find);
        res.status(200).send(`
            ${nav}
            <h1>Expense Deleted</h1>
            <p>${find.category} $${find.amount} have been deleted.</p>
            <a href="/expenses/undo/">Undo</a>
            <a href="/view/hide">View Expense</a>`);
    }
});

//IH#5: Undo the last delete.
app.get('/expenses/undo', async (req,res) => {

    const find = await expenses.undoDelete();

    if(!find){

        res.status(404).send(`
            ${nav}
            <h1>Nothing to undo</h1>
            <a href="/view/hide">View Expenses</a>`);
    }
    else{

        console.log('Undo delete, expenses restored');
        res.status(200).send(`
            ${nav}
            <h1>Expense Restored</h1>
            <p>Your expense is back on the list.</p>
            <a href="/view/hide">View Expenses</a>`);
    }
});
