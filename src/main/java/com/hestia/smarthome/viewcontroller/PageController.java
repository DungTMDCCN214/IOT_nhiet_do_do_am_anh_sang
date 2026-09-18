package com.hestia.smarthome.viewcontroller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/")
    public String home() { return "redirect:/login"; }

    @GetMapping("/login")
    public String login() { return "login"; }

    @GetMapping("/dashboard")
    public String dashboard() { return "dashboard"; }

    @GetMapping("/sensors")
    public String sensors() { return "sensors"; }

    @GetMapping("/devices/history")
    public String deviceHistory() { return "device-history"; }

    @GetMapping("/account")
    public String account() { return "account"; }
}
