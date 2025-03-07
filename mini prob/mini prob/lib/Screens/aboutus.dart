import 'package:flutter/material.dart';

class AboutUsPage extends StatelessWidget {
  const AboutUsPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("About Us"),
      ),
      body: SingleChildScrollView( // Wrap content in SingleChildScrollView
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 20),
            const Center(
              child: Text(
                "About RouteTrax",
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.black,
                ),
              ),
            ),
            const SizedBox(height: 20),
            const Text(
              "Welcome to RouteTrax!",
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
            const SizedBox(height: 10),
            const Text(
              "RouteTrax is a cutting-edge real-time bus tracking system designed specifically for educational institutions. We understand the importance of safe and reliable transportation for students, and RouteTrax provides the tools and technology to enhance the efficiency and transparency of college transportation services. By leveraging GPS technology, a user-friendly interface, and robust data management, RouteTrax empowers students, parents, and administrators to stay connected and informed throughout the journey.",
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 20),
            const Text(
              "Our Mission",
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
            const SizedBox(height: 10),
            const Text(
              "Our mission is to revolutionize college transportation by providing a secure, reliable, and user-friendly platform that:\n\n"
                  "• Ensures Student Safety: Real-time tracking and driver authentication prioritize student safety and provide peace of mind for parents.\n\n"
                  "• Enhances Communication: Instant notifications and ETA updates keep parents and administrators informed about bus locations and any potential delays.\n\n"
                  "• Optimizes Efficiency: Streamlined data management and route optimization tools help transportation departments improve efficiency and reduce operational costs.\n\n"
                  "• Promotes Transparency: Open communication channels and accessible tracking information foster trust and transparency between all stakeholders.",
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 20),
            const Text(
              "Contact Us",
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 10),
            const Text(
              "Email:\n1. Hadi Maliyakkal - u2204028@rajagiri.edu.in \n2. Kevin Peter - u2204039@rajagiri.edu.in \n3. Edvin Saji - u2204024@rajagiri.edu.in \n4. Alan Tiju Joseph -u2204008@rajagiri.edu.in \nPhone: +91 1234 567 890",
              style: TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 40), // Add extra space to avoid tight spacing
            const Center(
              child: Text(
                "© 2025 RouteTrax. All Rights Reserved.",
                style: TextStyle(fontSize: 14, color: Colors.grey),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
