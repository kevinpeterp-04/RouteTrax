import 'package:flutter/material.dart';
import 'aboutus.dart';
import 'Lost_&_found.dart';
import 'Status.dart';

class DriverScreen extends StatefulWidget {
  const DriverScreen({Key? key}) : super(key: key);

  @override
  State<DriverScreen> createState() => _DriverScreenState();
}

class _DriverScreenState extends State<DriverScreen> {
  bool _isJourneyStarted = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Driver"),
        actions: [
          IconButton(
            icon: const Icon(Icons.info_outline),
            tooltip: "About Us",
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const AboutUsPage(),
                ),
              );
            },
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            // Start Journey Button (Circular)
            SizedBox( // Added SizedBox to control width
              child: ElevatedButton(
                onPressed: () {
                  setState(() {
                    _isJourneyStarted = !_isJourneyStarted;
                  });
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.all(100), // Adjust padding for size
                  textStyle: const TextStyle(fontSize: 30),
                  shape: const CircleBorder(), // Make it a circle
                ),
                child: Text(
                  _isJourneyStarted ? 'END JOURNEY' : 'START JOURNEY',
                  textAlign: TextAlign.center, // Center text within the circle
                ),
              ),
            ),

            const SizedBox(height: 40),
            SizedBox( // Added SizedBox for Status
              width: 250, // Same width as Start Journey button
              child: ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => StatusScreen()),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    vertical: 16.0,
                    horizontal: 32.0,
                  ),
                  textStyle: const TextStyle(fontSize: 20),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30.0),
                  ),
                ),
                child: const Text('Status'),
              ),
            ),
            const SizedBox(height: 20),
            SizedBox( // Added SizedBox for Lost & Found
              width: 250, // Same width as Start Journey button
              child: ElevatedButton(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => LostAndFoundScreen()),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    vertical: 16.0,
                    horizontal: 32.0,
                  ),
                  textStyle: const TextStyle(fontSize: 20),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(30.0),
                  ),
                ),
                child: const Text('Lost & Found'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}