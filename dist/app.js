import inquirer from 'inquirer';
import pkg from 'pg';
const { Client } = pkg;
const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'employeetracker',
    password: 'Password',
    port: 5432,
});
client.connect()
    .then(() => console.log('Connected to the database'))
    .catch(err => console.error('Connection error', err.stack));
const promptUser = () => {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What would you like to do?',
            choices: [
                'View all employees',
                'View all roles',
                'Add an employee',
                'Update an employee role',
                'View all departments',
                'Exit'
            ],
        },
    ]).then((answers) => {
        switch (answers.action) {
            case 'View all employees':
                viewAllEmployees();
                break;
            case 'View all roles':
                viewAllRole();
                break;
            case 'Add an employee':
                addEmployee();
                break;
            case 'Update an employee role':
                updateEmployeeRole();
                break;
            case 'View all departments':
                viewAllDepartments();
                break;
            case 'Exit':
                client.end();
                break;
        }
    });
};
const viewAllEmployees = () => {
    client.query('SELECT * FROM employee', (err, res) => {
        if (err)
            throw err;
        console.table(res.rows);
        promptUser();
    });
};
const viewAllDepartments = () => {
    client.query('SELECT * FROM department', (err, res) => {
        if (err)
            throw err;
        console.table(res.rows);
        promptUser();
    });
};
const viewAllRole = () => {
    client.query('SELECT * FROM department', (err, res) => {
        if (err)
            throw err;
        console.table(res.rows);
        promptUser();
    });
};
const addEmployee = async () => {
    const roles = await client.query('SELECT * FROM role');
    const roleChoices = roles.rows.map((role) => ({ name: role.title, value: role.id }));
    const departments = await client.query('SELECT * FROM department');
    const departmentChoices = departments.rows.map((dept) => ({ name: dept.name, value: dept.id }));
    inquirer.prompt([
        {
            type: 'input',
            name: 'first_name',
            message: 'Enter the first name of the employee:',
        },
        {
            type: 'input',
            name: 'last_name',
            message: 'Enter the last name of the employee:',
        },
        {
            type: 'list',
            name: 'role_id',
            message: 'Select the role of the employee:',
            choices: roleChoices,
        },
        {
            type: 'list',
            name: 'department_id',
            message: 'Select the department of the employee:',
            choices: departmentChoices,
        },
        {
            type: 'input',
            name: 'manager_id',
            message: 'Enter the manager ID (leave blank if none):',
            default: '',
        },
    ]).then((answers) => {
        const { first_name, last_name, role_id, department_id, manager_id } = answers;
        client.query('INSERT INTO employee (first_name, last_name, role_id, department_id, manager_id) VALUES ($1, $2, $3, $4, $5)', [first_name, last_name, role_id, department_id, manager_id ? parseInt(manager_id) : null], (err) => {
            if (err)
                throw err;
            console.log('Employee added successfully!');
            promptUser();
        });
    });
};
const updateEmployeeRole = async () => {
    const employees = await client.query('SELECT * FROM employee');
    const employeeChoices = employees.rows.map((emp) => ({
        name: `${emp.first_name} ${emp.last_name}`,
        value: emp.id,
    }));
    const roles = await client.query('SELECT * FROM role');
    const roleChoices = roles.rows.map((role) => ({
        name: role.title,
        value: role.id,
    }));
    inquirer.prompt([
        {
            type: 'list',
            name: 'employee_id',
            message: 'Select the employee whose role you want to update:',
            choices: employeeChoices,
        },
        {
            type: 'list',
            name: 'new_role_id',
            message: 'Select the new role for the employee:',
            choices: roleChoices,
        },
    ]).then((answers) => {
        const { employee_id, new_role_id } = answers;
        client.query('UPDATE employee SET role_id = $1 WHERE id = $2', [new_role_id, employee_id], (err) => {
            if (err)
                throw err;
            console.log('Employee role updated successfully!');
            promptUser();
        });
    });
};
promptUser();
