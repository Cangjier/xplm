import { Type } from "../../../System/Type";
export class processConfig {
    public static op_Implicit(target?: any): processConfig {
        return {} as any;
    }
    public filePath?: string;
    public arguments?: any;
    public workingDirectory?: string;
    public useShellExecute?: boolean;
}