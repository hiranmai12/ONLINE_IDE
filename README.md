# MERN Stack Online IDE

A full-featured online Integrated Development Environment (IDE) that supports JavaScript, Python, and Java code execution. Built with React, Node.js, Express, and MongoDB.

## Features

- **Monaco Editor Integration** - Professional code editor with syntax highlighting
- **Multi-Language Support** - JavaScript, Python, and Java
- **File Management** - Create, rename, delete, and switch between files
- **Code Execution** - Safe sandboxed execution for all supported languages
- **Real-time Output** - Terminal-like output panel displaying execution results
- **Theme Toggle** - Switch between light and dark themes
- **Autosave** - Automatic saving every 2 seconds
- **Toast Notifications** - User feedback for all operations
- **VS Code-like Layout** - Familiar interface with file explorer, editor, and output console

## Project Structure

```
project/
├── backend/
│   ├── models/
│   │   ├── File.js           # File schema
│   │   └── Workspace.js      # Workspace schema
│   ├── routes/
│   │   ├── fileRoutes.js     # File CRUD endpoints
│   │   ├── workspaceRoutes.js # Workspace endpoints
│   │   └── executeRoutes.js  # Code execution endpoint
│   ├── utils/
│   │   └── codeExecutor.js   # Code execution logic with sandboxing
│   ├── server.js             # Express server
│   └── package.json
└── src/
    ├── components/
    │   ├── FileExplorer.tsx  # File tree sidebar
    │   ├── Editor.tsx        # Monaco editor wrapper
    │   ├── OutputTerminal.tsx # Output display
    │   ├── Toolbar.tsx       # Top toolbar
    │   └── Toast.tsx         # Notification component
    ├── api/
    │   └── index.ts          # API client
    ├── types/
    │   └── index.ts          # TypeScript types
    └── App.tsx               # Main application
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Python 3 (for Python code execution)
- Java JDK (for Java code execution)

### 1. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
npm install
```

### 2. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
mongod --dbpath /path/to/your/data
```

**Option B: MongoDB Atlas (Cloud)**
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/online-ide
```

For MongoDB Atlas, use:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/online-ide?retryWrites=true&w=majority
```

### 4. Start the Backend Server

```bash
cd backend
npm start
```

The backend will run on `http://localhost:5000`

### 5. Start the Frontend

In a new terminal:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### 6. Test Code Execution

Open your browser to `http://localhost:5173` and:

1. Create a new file using the `+` button
2. Select the language (JavaScript/Python/Java)
3. Write your code
4. Click "Run Code"

## Code Execution Details

### JavaScript
- Executed in a **vm2 sandbox** with 1-second timeout
- Memory limits enforced
- Safe console.log support

### Python
- Executed via `python3` command
- 5-second timeout
- Runs in temporary isolated files
- Full stderr capture for errors

### Java
- Compiled with `javac`
- Executed with `java` command
- 5-second timeout for both compilation and execution
- Automatic class name extraction
- Full compilation and runtime error handling

## Security Features

- **VM2 Sandbox** for JavaScript execution
- **Process isolation** for Python and Java
- **Timeout limits** on all executions
- **Temporary file cleanup** after execution
- **Restricted system access** for all code execution
- **No file system access** outside /tmp directory

## Sample Code

### JavaScript
```javascript
console.log("Hello, World!");
```

### Python
```python
print("Hello, World!")
```

### Java
```java
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

## API Endpoints

### Workspaces
- `GET /api/workspaces` - Get all workspaces
- `GET /api/workspaces/:id` - Get workspace by ID
- `POST /api/workspaces` - Create new workspace
- `PUT /api/workspaces/:id` - Update workspace

### Files
- `GET /api/files?workspaceId=<id>` - Get all files in workspace
- `GET /api/files/:id` - Get file by ID
- `POST /api/files` - Create new file
- `PUT /api/files/:id` - Update file
- `DELETE /api/files/:id` - Delete file

### Execution
- `POST /api/execute` - Execute code
  ```json
  {
    "code": "console.log('hello')",
    "language": "javascript"
  }
  ```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod --version`
- Check connection string in `.env`
- Verify network access if using Atlas

### Code Execution Errors

**Python:**
- Ensure `python3` is installed: `python3 --version`
- Add Python to PATH if needed

**Java:**
- Ensure JDK is installed: `javac -version` and `java -version`
- Add Java to PATH if needed

### Port Already in Use
- Backend (5000): Change `PORT` in `.env`
- Frontend (5173): Vite will automatically use next available port

## Known Limitations

- Maximum execution time: 5 seconds for Python/Java, 1 second for JavaScript
- No support for external dependencies/imports in executed code
- Limited memory for JavaScript execution
- Code runs in isolated environment without network access

## License

MIT License
