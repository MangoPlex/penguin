use sysinfo::{Pid, System};

pub fn get_memory_usage(pid: u32) -> f64 {
    let mut system = System::new_all();
    system.refresh_all();

    if let Some(process) = system.process(Pid::from_u32(pid)) {
        let memory_in_kb = process.memory();
        let memory_in_mb = memory_in_kb as f64 / 1024.0;
        memory_in_mb
    } else {
        0.0
    }
}
