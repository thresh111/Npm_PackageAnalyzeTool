import * as fs from 'fs'
import * as path from 'path'

interface PackageJson {
  dependencies?: { [key: string]: string }
  devDependencies?: { [key: string]: string }
  peerDependencies?: { [key: string]: string }
}

interface DependencyGraph {
  [module: string]: string[]
}

function processPackageJson(filePath: string, graph: DependencyGraph) {
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const packageJson: PackageJson = JSON.parse(fileContent)

  const moduleName = path.basename(path.dirname(filePath))
  const allDependencies: string[] = []

  if (packageJson.dependencies) {
    allDependencies.push(...Object.keys(packageJson.dependencies))
  }

  if (packageJson.devDependencies) {
    allDependencies.push(...Object.keys(packageJson.devDependencies))
  }

  if (packageJson.peerDependencies) {
    allDependencies.push(...Object.keys(packageJson.peerDependencies))
  }

  graph[moduleName] = allDependencies
}

function traverseNodeModules(basePath: string, graph: DependencyGraph) {
  const nodeModulesPath = path.join(basePath, 'node_modules')
  if (!fs.existsSync(nodeModulesPath)) {
    return
  }

  fs.readdirSync(nodeModulesPath).forEach((module) => {
    const modulePath = path.join(nodeModulesPath, module)
    const packageJsonPath = path.join(modulePath, 'package.json')

    if (fs.existsSync(packageJsonPath)) {
      processPackageJson(packageJsonPath, graph)
      traverseNodeModules(modulePath, graph)
    }
  })
}

function generateDependencyGraph(basePath: string): DependencyGraph {
  const graph: DependencyGraph = {}
  traverseNodeModules(basePath, graph)
  return graph
}

// Example usage:
const basePath = '' // Replace with the actual path to your project
const dependencyGraph = generateDependencyGraph(basePath)
console.log(dependencyGraph)
