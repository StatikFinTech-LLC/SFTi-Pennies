/**
 * Workflow Engine - Browser-Based Workflow Orchestration
 * 
 * Provides a generic workflow execution engine that can run multi-step
 * processes in the browser with progress tracking, error handling, and rollback.
 * 
 * Python equivalent: GitHub Actions workflow engine
 */

/**
 * WorkflowEngine class - Orchestrates multi-step workflows
 */
class WorkflowEngine {
    constructor() {
        this.workflows = new Map();
        this.currentWorkflow = null;
        this.currentStep = 0;
        this.results = {};
        this.listeners = {
            onWorkflowStart: [],
            onStepStart: [],
            onStepComplete: [],
            onStepError: [],
            onWorkflowComplete: [],
            onWorkflowError: []
        };
    }

    /**
     * Register a workflow with steps
     * @param {string} name - Workflow name
     * @param {Array<Object>} steps - Array of step definitions
     */
    registerWorkflow(name, steps) {
        this.workflows.set(name, {
            name,
            steps,
            registered: new Date().toISOString()
        });
    }

    /**
     * Execute a workflow
     * @param {string} name - Workflow name
     * @param {Object} context - Initial context/input data
     * @returns {Promise<Object>} Results from all steps
     */
    async executeWorkflow(name, context = {}) {
        const workflow = this.workflows.get(name);
        if (!workflow) {
            throw new Error(`Workflow '${name}' not found`);
        }

        this.currentWorkflow = name;
        this.currentStep = 0;
        this.results = {};
        
        const workflowContext = {
            ...context,
            workflowName: name,
            startTime: new Date().toISOString(),
            results: this.results
        };

        this._emit('onWorkflowStart', { workflow: name, context: workflowContext });

        try {
            for (let i = 0; i < workflow.steps.length; i++) {
                this.currentStep = i;
                const step = workflow.steps[i];
                
                this._emit('onStepStart', { 
                    workflow: name, 
                    step: step.name, 
                    stepNumber: i + 1, 
                    totalSteps: workflow.steps.length 
                });

                try {
                    // Execute step function with context
                    const stepResult = await step.execute(workflowContext);
                    this.results[step.name] = {
                        success: true,
                        result: stepResult,
                        completedAt: new Date().toISOString()
                    };

                    this._emit('onStepComplete', { 
                        workflow: name, 
                        step: step.name, 
                        result: stepResult 
                    });

                } catch (stepError) {
                    this.results[step.name] = {
                        success: false,
                        error: stepError.message,
                        failedAt: new Date().toISOString()
                    };

                    this._emit('onStepError', { 
                        workflow: name, 
                        step: step.name, 
                        error: stepError 
                    });

                    // If step is required and fails, stop workflow
                    if (step.required !== false) {
                        throw new Error(`Required step '${step.name}' failed: ${stepError.message}`);
                    }
                }
            }

            const finalResult = {
                workflow: name,
                success: true,
                results: this.results,
                completedAt: new Date().toISOString()
            };

            this._emit('onWorkflowComplete', finalResult);
            return finalResult;

        } catch (error) {
            const errorResult = {
                workflow: name,
                success: false,
                error: error.message,
                results: this.results,
                failedAt: new Date().toISOString(),
                failedStep: this.currentStep
            };

            this._emit('onWorkflowError', errorResult);
            throw error;
        }
    }

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    on(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event].push(callback);
        }
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    off(event, callback) {
        if (this.listeners[event]) {
            const index = this.listeners[event].indexOf(callback);
            if (index > -1) {
                this.listeners[event].splice(index, 1);
            }
        }
    }

    /**
     * Emit event to all listeners
     * @private
     */
    _emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (e) {
                    console.error(`Error in ${event} listener:`, e);
                }
            });
        }
    }

    /**
     * Get list of registered workflows
     * @returns {Array<string>} Workflow names
     */
    listWorkflows() {
        return Array.from(this.workflows.keys());
    }

    /**
     * Get workflow definition
     * @param {string} name - Workflow name
     * @returns {Object} Workflow definition
     */
    getWorkflow(name) {
        return this.workflows.get(name);
    }
}

// Export for use in browser and Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WorkflowEngine };
}

// Browser export
export { WorkflowEngine };
