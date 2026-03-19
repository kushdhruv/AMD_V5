import 'package:flutter/material.dart';
import '../theme.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:share_plus/share_plus.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter/services.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final Map<String, TextEditingController> _controllers = {};
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    // Initialize controllers for text fields
    
  }

  @override
  void dispose() {
    _controllers.forEach((_, controller) => controller.dispose());
    super.dispose();
  }

  Future<void> _handleAction(String action) async {
    if (action.startsWith('navigate:')) {
      // Navigate to route
      final target = action.split(':')[1];
      Navigator.pushNamed(context, '/$target');
    } else if (action.startsWith('share:')) {
      // Smart Share: Try to find 'output' field, else default
      String textToShare = "Check out my event!";
      if (_controllers.containsKey('output')) {
          textToShare = _controllers['output']!.text;
      }
      Share.share(textToShare);
    } else if (action.startsWith('copy:')) {
      // Smart Copy: Try to find 'output' field, else default
      String textToCopy = "Copied Content";
      if (_controllers.containsKey('output')) {
          textToCopy = _controllers['output']!.text;
      }
      
      Clipboard.setData(ClipboardData(text: textToCopy));
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Copied to clipboard!')),
      );
    } else if (action.startsWith('save_form:')) {
      // Collect data
      final data = _controllers.map((key, controller) => MapEntry(key, controller.text));
      
      setState(() => _loading = true);
      try {
        await Supabase.instance.client.from('registrations').insert({
          'app_name': 'Smart Registration Helper',
          'data': data,
        });

        if (mounted) {
            showDialog(
                context: context,
                builder: (context) => AlertDialog(
                title: const Text('Success'),
                content: const Text('Registration Submitted!'),
                actions: [TextButton(onPressed: () => Navigator.pop(context), child: const Text('OK'))],
                ),
            );
        }
      } catch (e) {
        if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Error: $e')));
        }
      } finally {
        if (mounted) setState(() => _loading = false);
      }
    } else if (action.startsWith('ai:')) {
       setState(() => _loading = true);
       final type = action.split(':')[1].split('_')[1]; // e.g. generate_announcement -> announcement
       
       // Collect all form data
       final data = _controllers.map((key, controller) => MapEntry(key, controller.text));
       
       try {
         final url = Uri.parse('http://10.0.2.2:3000/api/ai-proxy');
         final response = await http.post(
            url, 
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode({'type': type, 'data': data}),
         );

         if (response.statusCode == 200) {
             final result = jsonDecode(response.body)['result'];
             if (_controllers.containsKey('output')) {
                 _controllers['output']!.text = result;
             }
             if (mounted) {
               ScaffoldMessenger.of(context).showSnackBar(
                 const SnackBar(content: Text('AI Content Generated!')),
               );
             }
         } else {
             throw Exception('Failed to load AI response');
         }
       } catch (e) {
         if (mounted) {
            showDialog(
                context: context, 
                builder: (c) => AlertDialog(title: const Text('Error'), content: Text(e.toString()), actions: [TextButton(onPressed: () => Navigator.pop(c), child: const Text('OK'))])
            );
         }
       } finally {
         setState(() => _loading = false);
       }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Image.network(
            'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80',
            height: 250,
            width: double.infinity,
            fit: BoxFit.cover,
            errorBuilder: (c,e,s) => Container(height: 200, color: Colors.grey[800]),
        ),
      ),SizedBox(height: 12),
              Text(
        'TechFest 2026',
        style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.bold,
            color: null,
        ),
      ),SizedBox(height: 8),
              Text(
        'March 15th • Main Auditorium',
        style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.normal,
            color: Color(0xFF94A3B8),
        ),
      ),SizedBox(height: 8),
              Text(
        'The biggest student hackathon of the year. Join us for 24 hours of code, food, and fun.',
        style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.normal,
            color: null,
        ),
      ),SizedBox(height: 8),
              SizedBox(
        width: double.infinity,
        child: ElevatedButton(
            onPressed: false && _loading ? null : () => _handleAction('navigate:register'), 
            style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: Text('Register Now'),
        ),
      ),SizedBox(height: 12),
                ],
            ),
          ),
          if (_loading)
            const Positioned(
                top: 16,
                right: 16,
                child: Card(
                    elevation: 4,
                    shape: CircleBorder(),
                    child: Padding(
                        padding: EdgeInsets.all(8.0),
                        child: CircularProgressIndicator(strokeWidth: 3),
                    ),
                ),
            ),
        ],
      ),
    );
  }
}
