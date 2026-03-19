import 'package:flutter/material.dart';
import '../theme.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:share_plus/share_plus.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter/services.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final Map<String, TextEditingController> _controllers = {};
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    // Initialize controllers for text fields
    _controllers['name'] = TextEditingController();
    _controllers['email'] = TextEditingController();
    _controllers['phone'] = TextEditingController();
    _controllers['college'] = TextEditingController();
    _controllers['dept'] = TextEditingController();
    _controllers['team_name'] = TextEditingController();
    _controllers['diet'] = TextEditingController();
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
      appBar: AppBar(title: Text('Participant Details'), centerTitle: true),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextField(
        controller: _controllers['name'],
        decoration: InputDecoration(
            labelText: 'Full Name',
            hintText: 'John Doe',
            filled: true,
            fillColor: AppTheme.surface,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        ),
        obscureText: false,
        maxLines: 1,
      ),SizedBox(height: 16),
              TextField(
        controller: _controllers['email'],
        decoration: InputDecoration(
            labelText: 'Email',
            hintText: 'john@example.com',
            filled: true,
            fillColor: AppTheme.surface,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        ),
        obscureText: false,
        maxLines: 1,
      ),SizedBox(height: 16),
              TextField(
        controller: _controllers['phone'],
        decoration: InputDecoration(
            labelText: 'Phone Number',
            hintText: '+1 234...',
            filled: true,
            fillColor: AppTheme.surface,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        ),
        obscureText: false,
        maxLines: 1,
      ),SizedBox(height: 16),
              TextField(
        controller: _controllers['college'],
        decoration: InputDecoration(
            labelText: 'College / Organization',
            hintText: 'University of...',
            filled: true,
            fillColor: AppTheme.surface,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        ),
        obscureText: false,
        maxLines: 1,
      ),SizedBox(height: 16),
              TextField(
        controller: _controllers['dept'],
        decoration: InputDecoration(
            labelText: 'Year & Department',
            hintText: '3rd Year CS',
            filled: true,
            fillColor: AppTheme.surface,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        ),
        obscureText: false,
        maxLines: 1,
      ),SizedBox(height: 16),
              const Divider(),SizedBox(height: 12),
              Text(
        'Additional Info',
        style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: null,
        ),
      ),SizedBox(height: 8),
              TextField(
        controller: _controllers['team_name'],
        decoration: InputDecoration(
            labelText: 'Team Name (Optional)',
            hintText: 'The Hackers',
            filled: true,
            fillColor: AppTheme.surface,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        ),
        obscureText: false,
        maxLines: 1,
      ),SizedBox(height: 16),
              TextField(
        controller: _controllers['diet'],
        decoration: InputDecoration(
            labelText: 'Dietary Preferences',
            hintText: 'Veg, Non-Veg, etc.',
            filled: true,
            fillColor: AppTheme.surface,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        ),
        obscureText: false,
        maxLines: 1,
      ),SizedBox(height: 16),
              SizedBox(
        width: double.infinity,
        child: ElevatedButton(
            onPressed: false && _loading ? null : () => _handleAction('save_form:registrations'), 
            style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: Text('Submit Registration'),
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
